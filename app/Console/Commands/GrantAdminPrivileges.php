<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Enum\RolesEnum;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class GrantAdminPrivileges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:grant {email : The email of the user to grant admin privileges to} {--role=super_admin : The role to assign (super_admin or admin)}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Grant admin privileges to a user by email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $role = $this->option('role');

        // Validate role
        if (!in_array($role, ['super_admin', 'admin'])) {
            $this->error('Invalid role. Use "super_admin" or "admin".');
            return 1;
        }

        // Find user
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return 1;
        }

        try {
            // Start transaction
            DB::beginTransaction();

            // Ensure the role exists before assigning it.
            Role::firstOrCreate([
                'name' => $role,
                'guard_name' => 'web',
            ]);

            // Remove all previous roles
            $user->syncRoles([]);

            // Assign new role using enum
            $roleEnum = RolesEnum::from($role);
            $user->assignRole($role);

            // Update primary role using enum value
            $user->update([
                'primary_role' => $roleEnum->value,
            ]);

            // Update active roles
            $user->update([
                'active_roles' => json_encode([$roleEnum->value]),
            ]);

            DB::commit();

            $this->info("✓ Successfully granted '{$role}' role to {$user->name} ({$email})");
            $this->line("Current role: {$role}");
            $this->line("User ID: {$user->id}");

            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error granting admin privileges: " . $e->getMessage());
            return 1;
        }
    }
}
