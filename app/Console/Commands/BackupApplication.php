<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;
use ZipArchive;

class BackupApplication extends Command
{
    protected $signature = 'app:backup {--retention=7 : Number of backup directories to keep} {--path= : Optional backup directory}';

    protected $description = 'Create a private database and uploaded-file backup with retention cleanup';

    public function handle(): int
    {
        $backupRoot = $this->option('path') ?: storage_path('app/private/backups');
        $timestamp = now()->format('Y-m-d_His');
        $backupDirectory = $backupRoot . DIRECTORY_SEPARATOR . $timestamp;
        $databaseDirectory = $backupDirectory . DIRECTORY_SEPARATOR . 'database';

        File::ensureDirectoryExists($databaseDirectory);

        try {
            $databaseArtifact = $this->backupDatabase($databaseDirectory);
            $storageArtifact = $this->backupStorage($backupDirectory);
            $manifest = [
                'created_at' => now()->toIso8601String(),
                'environment' => app()->environment(),
                'database_connection' => config('database.default'),
                'database_artifact' => $databaseArtifact,
                'storage_artifact' => $storageArtifact,
            ];
            File::put($backupDirectory . DIRECTORY_SEPARATOR . 'manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            $this->pruneBackups($backupRoot);
        } catch (\Throwable $exception) {
            File::deleteDirectory($backupDirectory);
            $this->error('Backup failed: ' . $exception->getMessage());

            return self::FAILURE;
        }

        $this->info("Backup created: {$backupDirectory}");

        return self::SUCCESS;
    }

    private function backupDatabase(string $databaseDirectory): string
    {
        $connection = config('database.default');
        $filename = "database-{$connection}." . ($connection === 'sqlite' ? 'sqlite' : 'sql');
        $destination = $databaseDirectory . DIRECTORY_SEPARATOR . $filename;

        if ($connection === 'sqlite') {
            $source = config('database.connections.sqlite.database');
            if ($source === ':memory:' || ! File::exists($source)) {
                throw new \RuntimeException('The SQLite database file does not exist.');
            }
            File::copy($source, $destination);

            return 'database/' . $filename;
        }

        if (! in_array($connection, ['mysql', 'mariadb'], true)) {
            throw new \RuntimeException("Automatic backup is not configured for {$connection}. Use the deployment runbook for this driver.");
        }

        $config = config("database.connections.{$connection}");
        $command = [
            'mysqldump',
            '--single-transaction',
            '--routines',
            '--events',
            '--triggers',
            '--host=' . $config['host'],
            '--port=' . $config['port'],
            '--user=' . $config['username'],
            $config['database'],
        ];
        $process = new Process($command, base_path(), ['MYSQL_PWD' => (string) $config['password']]);
        $process->run();
        if ($process->isSuccessful()) {
            File::put($destination, $process->getOutput());

            return 'database/' . $filename;
        }

        $this->warn('mysqldump is unavailable; using the built-in PDO export fallback.');
        File::put($destination, $this->exportMySqlWithPdo());

        return 'database/' . $filename;
    }

    private function exportMySqlWithPdo(): string
    {
        $pdo = DB::connection()->getPdo();
        $tables = DB::select('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
        $sql = "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableRow) {
            $values = array_values((array) $tableRow);
            $table = (string) ($values[0] ?? '');
            if ($table === '') {
                continue;
            }

            $identifier = str_replace('`', '``', $table);
            $definition = DB::selectOne("SHOW CREATE TABLE `{$identifier}`");
            $definitionValues = array_values((array) $definition);
            $createStatement = (string) ($definitionValues[1] ?? '');
            $sql .= "DROP TABLE IF EXISTS `{$identifier}`;\n{$createStatement};\n";

            $rows = DB::table($table)->get();
            foreach ($rows as $row) {
                $columns = array_keys((array) $row);
                $columnSql = implode(', ', array_map(fn ($column) => '`' . str_replace('`', '``', $column) . '`', $columns));
                $valueSql = implode(', ', array_map(function ($column) use ($row, $pdo) {
                    $value = ((array) $row)[$column];

                    return $value === null ? 'NULL' : $pdo->quote((string) $value);
                }, $columns));
                $sql .= "INSERT INTO `{$identifier}` ({$columnSql}) VALUES ({$valueSql});\n";
            }
            $sql .= "\n";
        }

        return $sql . "SET FOREIGN_KEY_CHECKS=1;\n";
    }

    private function backupStorage(string $backupDirectory): string
    {
        $archive = $backupDirectory . DIRECTORY_SEPARATOR . 'storage-app.zip';
        $source = storage_path('app');
        $zip = new ZipArchive();
        if ($zip->open($archive, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Unable to create the storage archive.');
        }

        if (File::isDirectory($source)) {
            $files = File::allFiles($source);
            foreach ($files as $file) {
                if (str_starts_with($file->getPathname(), $backupDirectory)) {
                    continue;
                }
                $zip->addFile($file->getPathname(), 'storage/' . ltrim(str_replace($source, '', $file->getPathname()), '\\/'));
            }
        }
        $zip->close();

        return 'storage-app.zip';
    }

    private function pruneBackups(string $backupRoot): void
    {
        $retention = max(1, (int) $this->option('retention'));
        $directories = collect(File::directories($backupRoot))
            ->sortDesc()
            ->values();

        $directories->slice($retention)->each(fn (string $directory) => File::deleteDirectory($directory));
    }
}
