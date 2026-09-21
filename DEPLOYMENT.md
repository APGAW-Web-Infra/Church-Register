# Deployment Runbook

This project is a Laravel + React + Inertia application. Production deployment should be treated as a controlled release with environment verification, database protection, and a rollback plan before traffic is switched over.

## 1. Production prerequisites

Before deployment, the church or hosting provider must supply:

- production host / VM / container platform
- MySQL database credentials and backup destination
- valid `APP_URL` and `APP_KEY`
- HTTPS certificate / reverse proxy configuration
- queue worker supervisor configuration
- logging and monitoring target
- approved mail provider and sender address, if email is turned on

## 2. Environment checklist

Set the following values in `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://church.example.org
APP_KEY=base64:...

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=apga_worldwide
DB_USERNAME=apga_user
DB_PASSWORD=super-secret

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=public
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.org
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS="hello@church.example.org"
MAIL_FROM_NAME="APGA Worldwide"
```

Important:
- Keep `APP_DEBUG=false` in production.
- Only enable a mail provider after church approval.
- Do not expose debugging or stack traces on public web pages.

## 3. Release steps

1. Pull the release branch or deploy artifact.
2. Install PHP dependencies:

```bash
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
```

3. Install frontend dependencies:

```bash
npm ci
npm run build
```

4. Run production migrations:

```bash
php artisan migrate --force
```

5. Clear and warm caches:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

6. Ensure storage permissions are writable for the web user:

```bash
chmod -R 775 storage bootstrap/cache
```

7. Start or restart the queue worker:

```bash
php artisan queue:work --queue=default --sleep=3 --tries=3 --daemon
```

8. Confirm the scheduler is active via cron or a process manager:

```bash
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

## 4. Backup strategy

Create automated backups for the database and uploaded content.

The application now provides an executable backup command:

```bash
php artisan app:backup --retention=14
```

It writes a timestamped backup directory under `storage/app/private/backups` containing a database artifact, a `storage/app` ZIP archive, and a `manifest.json`. SQLite databases are copied directly; MySQL/MariaDB prefer `mysqldump` and fall back to a PDO SQL export when the binary is unavailable. The Laravel scheduler runs this command daily at 02:00 with fourteen backup directories retained.

Recommended approach:
- nightly database dump with retention of at least 7 to 30 days
- daily backup copy to an offsite location or object storage
- backup verification at least once per week by restoring to a staging environment or running a test restore
- include `storage/app` and config files in backup scope if they include church-managed uploads or attachments

Example MySQL dump:

```bash
mysqldump --single-transaction --routines --events --triggers -u root -p apga_worldwide > backup_$(date +%F).sql
```

## 5. Monitoring and health checks

Check the following after deployment:

- homepage loads without errors
- login and admin authorization work for `super_admin|admin`
- member privacy and access control rules still hold
- report analytics pages render and totals match the underlying data
- media pages load published content and hide drafts
- queues and scheduled jobs do not fail silently
- laravel log and web server logs produce no fatal exceptions

Useful commands:

```bash
php artisan about
php artisan route:list
php artisan horizon:list # if Horizon is enabled
php artisan queue:work --once
```

A basic health endpoint can be checked with:

```bash
curl -sS https://church.example.org/api/health
```

The endpoint returns a JSON payload with the app environment, a live database-connection check, cache connectivity, and queue configuration status suitable for load balancer or monitoring verification.

Operational note:
- the health check is meant to confirm the deployment is alive and the required infrastructure dependencies are reachable
- a queue configuration that is present but not actively running is still reported as enabled for the release guard, and the worker should be verified separately in the host process manager
- scheduler configuration is also surfaced in the health payload so release checks can confirm the app includes a Laravel scheduler entry point and the deployment qualifies for `php artisan schedule:run`

### Queue and scheduler verification

Before release sign-off for a production host, confirm the following with the actual process manager or cron configuration:

- the queue worker is running for the chosen queue driver
- the dispatcher is pointed to the correct queue connection
- the scheduler is registered by the host cron entry and is not silently skipped
- failed jobs are visible in logs and are not accumulating without alerting

The codebase does not claim real host-level job execution without the actual server process manager being supplied, but the application now exposes the config-level readiness checks needed for the release gate.

## 6. Backup and rollback rehearsal

This is a dry-run rehearsal for the church operations team before any live production switch. It does not replace formal hosting approval, but it ensures the team can recover quickly if the release is unstable.

### 6.1 Backup rehearsal

Run the backup in a staging or mirrored environment first, then validate the artifact.

```bash
php artisan app:backup --retention=14

mysqldump --single-transaction --routines --events --triggers -u root -p apga_worldwide > backup_$(date +%F_%H%M%S).sql

tar -czf storage_backup_$(date +%F_%H%M%S).tar.gz storage/app
```

Validation steps:

- confirm the SQL dump is created and non-empty
- confirm the storage archive includes uploaded church content and attachments
- verify the dump can open without corruption using `head` or a restore test in staging
- confirm backup retention is configured for at least 7 to 30 days
- confirm the application backup manifest records the database driver and artifact paths

### 6.2 Rollback rehearsal

In staging, simulate a rollback with the previous release artifact and the latest verified backup.

```bash
git checkout <previous-release-tag>
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
npm ci
npm run build
php artisan migrate --force
php artisan optimize:clear
```

Then restore the database snapshot to the staging database and verify:

- login still works
- `super_admin|admin` routes remain protected
- admin pages render without authorization or data errors
- report and attendance totals still match the saved records
- the health endpoint responds as expected

### 6.3 Evidence to record

Capture the following before production approval:

- time and date of backup
- artifact path and size
- restore verification output
- rollback command output
- final health-check result after restore

## 7. Final security review for admin and member data paths

This review is intentionally focused on the privileged church workflows that expose member, attendance, and leadership data.

### 7.1 Required access controls

Verify the following before any production release is accepted:

- `/church-admin/*` routes are protected by `auth` and `role:super_admin|admin`
- member-only personal pages are protected by `auth` and ownership/admin checks
- member photo routes remain authenticated and do not expose private content to the public
- `/api/attendance/*` and `/api/invitations/*` are admin-only, not open to general members
- community-facing pages never include private member identity or direct-message content
- public media detail routes only expose published content and do not reveal draft data

### 7.2 Key validation points

- regular authenticated members receive `403 Forbidden` when hitting admin APIs
- admin users can view attendance totals and invitation stats
- absent/excused attendance records are not treated as qualifying totals for service attendance dashboards
- member photo delivery is restricted to owner/admin access only
- community and direct-message endpoints remain scoped to active memberships and authorized users

### 7.3 Evidence already checked

The codebase already includes regression coverage for these paths, including:

- admin dashboard access and role checks
- admin attendance API restrictions for regular members
- service register and attendance record integrity
- member dashboard health calculations using qualifying present/late main-service attendance only

This means the current release gate is based on real behavioral verifications rather than assumptions.

## 8. Launch gate

Do not treat the release as production-ready until the following are complete:

- production env variables are confirmed
- migrations run successfully with production DB
- assets build successfully
- auth and admin roles work as expected
- media/report pages render with live data
- queue worker is running
- backups are active and verified
- rollback procedure has been tested or reviewed with the hosting maintainer

This document is intentionally conservative: the church has not supplied production host details, backups, or an approved mail provider, so no production deployment is claimed here.
