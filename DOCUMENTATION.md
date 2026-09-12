CHURCH WEBSITE WITH FEATURES FOR CHURCH ADMINISTRATION:
ATTENDANCE SECTION: 
— Church's President Welcome Speech 
— Church's Vice-President Welcome Speech 
— Church's President Interview 
— Live In Service (Sunday School)
— Live In Service (Actual Service After Sunday School: Member)
— Live In Service (Actual Service After Sunday School: First Timer)
— Weekly-Monthly-Yearly Invitation League
— CHURCH MEMBER PROFILES
— BIRTHDAY CELEBRATIONS
— Pixelated Pictures Of All Absentees (6X3) Onscreen 
— All Minister's Official Portraits 
— All Minister's Official Autobiography
— All Minister's Official Social Media Handles
— All Unit Heads Official Portraits
— All Unit Heads Official Autobiography
— All Unit Heads Official Social Media Handles
— Weekly Sunday Reports (PDF)
— Monthly Report (PDF)
— Quarterly Report (PDF)
— Annual Report (PDF)
— WEEKLY SCORECARD
— WORKERS MEETING
— Opportunistic Interview With Word/Gospel/Music Ministers
— Opportunistic Interview With VIPS/Visitors
— SUNDAY SCHOOL & BIBLE STUDY SECTION
— APGAW BELIEVER'S FOUNDATION CLASS
— APGAW SCHOOL OF MINISTRY


## UNITS
Church Presbytery 
Church Administration Unit
Sunday School Unit
Choir Unit
Media Unit
Evangelism Unit
Sanitation Unit
Ushering Unit 
Protocol Unit
Technical Team Unit 
Welfare Unit
Children Evangelism Unit
Children Unit/Church
Youth Unit?Ministry
Men’s Movement 
Good Women’s Movement

Church Council (Board Of Trustees):
— Prophet (Dr.) Samuel Olugbenga Ilesanmi
Chairman, Board Of Trustees
— Evangelist (Mrs.) Esther Omobolanriwa Ilesanmi
— Elder Daniel Ayomide Ilesanmi
— Overseer Anthony Adebayo Olayinka
— Engr. Oludayo Amele
Secretary, Board Of Trustees

Church Leadership
— Prophet (Dr.) Samuel Olugbenga Ilesanmi
President & General Overseer, APGAW
— Evangelist (Mrs.) Esther Omobolanriwa Ilesanmi
Vice-President, APGAW
— Pastor Michael Olanrewaju
Senior Pastor, Church Administration

# APGA Worldwide - Church Management Platform
## Project Overview
**APGA Worldwide** is now operating as a church-aligned management platform built on a reusable Laravel + React foundation. The application has moved beyond the generic institutional shell and now includes real church-facing public pages, admin workflows, ministry management, leadership visibility, attendance tracking, reporting, and PDF export support.

This documentation reflects the actual project state:
1. The app already contains a working church operations foundation.
2. The public-facing church experience is now active and branded.
3. Remaining work is focused on production hardening, richer analytics, and deeper public content.
The current project is no longer a placeholder for a church site; it is a practical church operations platform with working backend and frontend flows.

### Latest Progress Update - 2026-09-03

The admin attendance workflows were reviewed against the live routes and backend behavior:

- `/church-admin/service-register?month=YYYY-MM` is a database-backed monthly register of active members and Sunday main-service attendance. Present and late marks are persisted per member/Sunday and repeated marks update the existing record.
- `/church-admin/attendance` is a database-backed attendance board for main service, Sunday School, workers meetings, and prayer meetings. Re-submitting the same member, service, and date updates the existing record instead of creating a duplicate.
- Attendance summaries count present and late records as attendees; absent and excused records remain available for correction history but do not inflate attendee totals.
- Sunday present/late attendance entered through either admin page can validate a pending invitation, keeping the invitation league aligned with attendance capture.
- Both pages and their write actions are restricted to authenticated `admin` and `super_admin` users.
- The shared browser session redirected unauthenticated requests to `/login`; authenticated visual verification requires an admin session.
- Church report titles, summaries, member counts, prayer-request counts, and scorecards remain manually authored records. Their analytics and PDF export summarize those saved rows.
- New church reports now automatically derive attendance and first-timer totals from raw present/late attendance records. Weekly reports use Monday-Sunday, monthly reports use the calendar month, quarterly reports use the calendar quarter, and annual reports use the calendar year containing the report date.
- Member dashboard church-health attendance now counts only present/late main-service records and compares weeks using the actual service date, so late data entry and absent/excused records do not distort the dashboard.
- The report center now includes a live attendance ledger showing qualifying present/late totals by status and service type alongside the saved report analytics.
- The report center now includes an eight-week live attendance trend grouped by the actual service week, keeping raw attendance movement visible independently from manually authored report periods.
- Added the first live JSON API surface: authenticated administrators can use `GET /api/attendance/stats` for attendance totals/status/service breakdowns and `GET /api/attendance/trends` for eight Monday-Sunday service-week buckets. Regular members receive `403 Forbidden`.
- Added `GET /api/attendance/report` for authenticated administrators with optional `from`, `to`, `service_type`, and `status` filters. It returns normalized attendance records plus total, qualifying, and first-timer metadata for integrations and external report consumers.
- Added protected invitation APIs: `GET /api/invitations/stats` reports registered, pending, validated, and validation-rate totals; `GET /api/invitations/leaderboard` returns ranked validated inviters. Both accept optional `from` and `to` dates; stats use registration dates and the leaderboard uses validation dates.
- The admin absentee board now includes a responsive 6x3 follow-up screen sourced from the latest absentee records, with generated identity tiles and an explicit empty state; detailed absentee records remain available below it.

The public church experience has been refined further:

- Replaced the static Send Message page with a working church contact form and added an admin inbox for open/resolved message follow-up.
- Giving remains intentionally informational only; verified bank account details will be added when supplied by the church.
- Added live attendance summary cards for total records, present/late attendance, first-timers, Sunday School, and main service.
- Added a latest-service attendance snapshot showing the most recent service date and recorded attendee total.
- Added a professional Vice-President welcome panel without inventing personal identity details before official information is supplied.
- Added authenticated church-admin event scheduling with public-calendar-compatible event records.
- Added optional Scripture references to media records and public sermon detail pages.
- Restricted public media detail pages to published content so drafts and archived items remain private.
- Added report period filtering so analytics and leadership PDF summaries can be scoped to weekly, monthly, quarterly, annual, or all reports.
- Added a publishable church announcements board with public published notices and authenticated admin management.
- Added admin event editing and transaction-safe registration controls for deadlines and capacity.
- Added downloadable iCalendar reminders for public events and registration reporting for church administrators.
- Added member message history with ownership filtering and database notifications when church messages are resolved.
- Added an authenticated member notification inbox with unread state and ownership-safe mark-as-read actions.
- Added an authenticated community feed with active-membership privacy and permission-controlled member posting.
- Added private direct messaging with member search, isolated threads, unread tracking, and self-message protection.
- Updated all public homepage footer navigation links to open their destination pages in new tabs with safe opener protection.
- Activated the six homepage platform feature cards with live links to prayer requests, small groups, events, member care, and church administration pages.
- Added newsletter subscription management with idempotent signup, tokenized unsubscribe, and an admin consent board.
- Added admin newsletter campaign drafting and queued per-recipient delivery to active subscribers with delivery counters.
- Completed the small-group workflow: public directory, admin creation, member joining, scheduled meetings, attendance capture, and private member communication.
- Added the admin-only monthly Sunday service register with member rows, referral-code reference, and Week 1-5 attendance columns.
- Added server-backed report comparison metrics and public media format filtering with clearer editorial metadata.
- Added mandatory member profile-photo upload at registration, profile-photo replacement in profile settings, and admin directory photo display.
- Moved member photos to private storage and added authenticated owner/admin-only photo delivery.

### Profile Photo Progress Update - 2026-09-03

- New member registration now requires a JPG, JPEG, PNG, or WebP profile photo up to 5 MB.
- Existing members can upload or replace their photo from profile settings.
- Uploaded photos are stored on the public disk and shown in the admin member directory with an initials fallback.
- Profile-photo and referral registration coverage passes: 8 tests passed with 64 assertions.

### Next Implementation Focus - 2026-09-03

The foundation is complete enough to move from feature accumulation to operational readiness and content quality. The next work is ordered as follows:

1. Newsletter mail and queue verification is intentionally skipped/deferred; the existing campaign workflow remains available for later production configuration.
2. Complete authorization, validation, privacy, and regression coverage across church administration and member workflows.
3. Extend reporting with deeper attendance, invitation, and ministry-growth trends plus branded report templates.
4. Improve public media with richer sermon galleries, story layouts, and editorial content workflows.
5. Prepare deployment documentation, backups, monitoring, rollback procedures, and verified giving information when the church supplies it.

### Progress Update - 2026-09-03

The next roadmap slice is now underway:

- Added a database-backed public small-group directory with active-group filtering, name ordering, meeting details, leader information, contact links, and an empty state.
- Added regression coverage for report filtering, public media related-content behavior, and small-group visibility.
- Focused reporting, public engagement, and small-group tests pass: 15 tests passed.

Remaining work includes deeper server-backed reporting trends and branded PDF templates, richer media gallery/story presentation. Public joining, active-member tracking, meeting scheduling, attendance tracking, and small-group communication are now implemented.

### Progress Update - 2026-09-03

The first security and regression slice is complete:

- Protected all `/church-admin/*` routes with the existing `super_admin|admin` role middleware.
- Fixed nested role argument handling in the custom `User::hasRole()` override so Spatie role middleware does not produce a server error.
- Added coverage proving administrators retain access and regular authenticated members receive `403 Forbidden`.
- Updated legacy church-admin feature fixtures to use the established admin identity.
- Verified the affected church feature suite: 25 tests passed with 227 assertions.

Newsletter infrastructure is intentionally skipped for now. The active path is remaining security coverage, richer public media storytelling, report templates, and deployment readiness.

### Progress Update - 2026-09-12

- Refreshed the public media gallery to use live database-backed featured stories instead of static sample fallback cards whenever published church content exists.
- Improved the editorial layout with stronger hero cards, hover depth, and cleaner story-grid presentation for sermons, testimonies, and media highlights.
- Kept the legacy fallback only as a final safety net so the page remains resilient when no published content is available.
- Fixed the church reporting analytics payload to include the server-backed leadership summary and insight strings the dashboard expects for summary cards and PDF exports.
- Added regression coverage to keep the report summary text aligned with actual attendance, first-timer, and prayer data.
- Enhanced the leadership PDF export with a branded APGA Worldwide cover, metrics cards, summary panels, and cleaner report-detail sections for church leadership use.
- Refined the church admin dashboard into a premium operations center with a clearer quick-action command grid and stronger Sunday-service access entry points.
- Expanded the reporting and dashboard narrative so the project is now aligned with the actual ministry-growth analytics and deployment-readiness roadmap.

### Progress Update - 2026-09-12 (Operations Center Refresh)

The next milestone after reporting and dashboard polish is operational clarity: admins should navigate into the most important workflows faster, without hiding the real attendance engine behind generic cards.

- Added a premium quick-actions panel on the church admin dashboard for service register, reports, scorecards, absentee follow-up, workers meetings, media board, announcements, and newsletters.
- Kept the real attendance register as the primary operational focus while making the supporting church workflows easier to access.
- The dashboard now behaves like a church operations command center rather than a static summary page.
- Validation remains focused on real backend behavior, not decorative placeholders.

### Progress Update - 2026-09-12 (Referral, onboarding, and outreach intelligence)

The church admin dashboard now includes live operational intelligence beyond attendance and lifecycle counts.

- Added referral conversion tracking from invitation registration and validation data, including total invites, validated invites, pending invites, and conversion rate.
- Added onboarding completion tracking from invitee member profile completion data, measuring completed vs incomplete member setup and onboarding rate.
- Added an outreach pipeline that surfaces the highest-priority follow-up actions in the correct order: pending referral follow-up, incomplete onboarding, then inactive member recovery.
- Updated the admin dashboard with a premium summary block and a staff-facing outreach queue so leaders can act on referral conversions and member recovery without static placeholders.
- Added regression coverage proving the exact values and ordering populate from the live database and remain aligned with real church workflow data.
- Verification evidence: the dashboard feature suite passed with 33 tests and 325 assertions after the latest update.

This milestone strengthens the admin command center and keeps the work focused on church-growth operations rather than decorative tooling.

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.4 | 2026-09-12 | Service-register attendance now auto-generates absent records for unmarked active members and the absentee board is treated as a derived follow-up view instead of a manual-entry form |
| 3.3 | 2026-09-12 | Added the engagement pipeline for referral follow-up, incomplete onboarding, and inactive member recovery to the church admin dashboard; documented the verified outreach workflow |
| 3.2 | 2026-09-12 | Added live referral conversion and onboarding completion metrics to the church admin dashboard; documented the verified operations milestone and regression evidence |
| 3.1 | 2026-09-12 | Admin dashboard refreshed into a premium operations center with live quick actions; reporting and roadmap documentation aligned with the current ministry-growth and deployment priorities |

### Operational Milestone Update - 2026-09-12

The current non-deployment operational milestone is now focused on resilience and data integrity, in line with the church’s required workflow boundaries:

- Backup and rollback rehearsal: create a database snapshot before major church-data changes, verify the restore path on a safe copy, and document the exact commands and rollback steps. This is a rehearsal and runbook step only; no production deployment action is performed during this stage.
- Security review: confirm that the admin/member data paths are read/write guarded by the correct role policy, that service-register attendance is only editable by `admin`/`super_admin`, and that absentee data remains a derived report from the attendance register rather than a freeform manual input surface.
- Data-source integrity: the service register is the system-of-record for Sunday attendance. Members who are active and not explicitly marked present, late, or excused are treated as absent automatically, and the absentee board follows that derived record set rather than allowing ad-hoc manual entries.
- Documentation sync: the admin, reports, and absentee workflow are now recorded as live operational behavior rather than aspirational plans.

This milestone deliberately excludes production validation and deployment sign-off, as requested, while preserving the required church operations governance around attendance, admin actions, and member data safety.

### Progress Update - 2026-09-03

- Report summary metrics now come from the Laravel controller response instead of relying only on client-side calculations.
- Server analytics include totals, attendance trend, weekly growth, average attendance, report-period counts, and strongest period.
- Reporting regression coverage verifies exact server values for totals, `+40` attendance trend, `+33%` weekly growth, and `Weekly (280)` strongest period.
- Focused reporting tests pass: 2 tests passed with 39 assertions.

### Reporting Progress Update - 2026-09-03

- Added server-backed scorecard analytics to the reporting dashboard.
- Report analytics now include invitations, new visitors, conversions, conversion rate, and score trend alongside attendance metrics.
- Added exact regression coverage for scorecard aggregation and period filtering: 2 reporting tests pass with 49 assertions.

### Media Progress Update - 2026-09-03

- Public media now presents format filters, story counts, scripture references, speaker details, publication dates, and video availability.
- Published-only detail pages and related-content selection remain enforced by the backend.
- Rich gallery/story layouts and image assets remain future content work.

### Security Progress Update - 2026-09-03

- Scoped the authenticated community data endpoint to active memberships, active communities, and active posts.
- Added the missing community membership relationships required for safe relationship filtering.
- Added privacy regression coverage proving members cannot receive posts from communities they have not joined.
- Community communication tests pass: 4 tests passed with 24 assertions.

### Referral Invitation Progress Update - 2026-09-03

- Every user receives a unique 10-character referral code and dashboard referral link.
- The referral-code migration backfills existing users, so older accounts are not excluded from the invitation league.
- Registration accepts and validates a member referral code, prefilled from `/register?ref=CODE`.
- Registration creates a pending invitation attribution; invalid codes and self-referrals are rejected.
- An invitation becomes valid only when the referred user has both registered through the member code and records present/late attendance for the Sunday main service.
- Saturday attendance, Sunday absence, registration alone, and duplicate validation attempts do not count.
- The invitation league leaderboard reads validated invitation records rather than manually entered scorecard invitation totals.
- Referral end-to-end coverage passes: 4 tests passed with 40 assertions.


## Reality Check: Current App vs Church Goal

### What the application currently does
The live codebase already contains the following real features:
- Public church pages, ministries, media, events, announcements, prayer requests, and board/trustee profiles.
- Authenticated church administration for members, attendance, reports, scorecards, leadership, meetings, media, events, messages, and newsletters.
- Member notifications, community posting, direct messaging, message resolution, event registration, and calendar downloads.
### Current reality after implementation
The project is now a church operations platform with active admin and public layers, including:
- The core church data model and admin/public workflows are implemented and backed by live database data.
- Reporting has baseline PDF export and summary analytics over saved report and scorecard rows, with attendance and first-timer totals automatically generated from raw attendance when a report is created; branded templates and deeper trends remain.
- Media, interviews, and communications are functional; richer editorial layouts and small-group workflows remain.
- Production readiness is the immediate priority, especially mail/queue configuration, security verification, testing, and deployment documentation.

The app now has a working church domain foundation, and the remaining work is focused first on production readiness, then on deeper analytics, richer sermon/media content, and more complete church-lifecycle workflows.


## Church Administration Feature Requirements

The website must support a leadership-led digital church experience that combines worship visibility, member management, and reporting.

### 1. Attendance & Worship Experience
- Weekly-Monthly-Yearly Invitation League ✅ validated referral leaderboard with registration-plus-Sunday-attendance confirmation
- Church member profiles
- Birthday celebrations
- Pixelated pictures of all absentees (6x3) on screen
- Weekly Sunday reports (PDF)
- Monthly report (PDF)
- Quarterly report (PDF)

### 2. Leadership & Ministry Profiles
- All ministers' official portraits
- All ministers' official autobiographies
- All ministers' official social media handles
- All unit heads' official portraits
- Mobile-responsive presentation for website visitors and church admins
- A structured backend for managing members, attendance, reports, and ministry profiles
4. Expand sermon/media storytelling and public-facing church content
5. Add life-cycle features such as prayer requests, events, and member communications

### 2026 Church Expansion Update
The project has now progressed beyond the generic app shell into a church-aligned platform with:
- public church landing page branding and weekly-church rhythm sections
- dedicated ministries and media pages for public church engagement
- data-driven ministry detail views tied to church ministry records
- PDF-ready church report export from the admin reporting dashboard
- admin-facing church operations for ministries, leadership, reports, absentee tracking, workers meetings, and media content
- dashboard analytics and church summary cards for reporting visibility
- active church dashboard and admin access checks aligned to real church operations
- public announcements and authenticated announcement management
- event editing and registration deadline/capacity enforcement
- public calendar downloads and admin registration status/member summaries
- member message history and resolution notifications
- authenticated notification inbox with read-state controls
- private community feed and member forum posting
- newsletter campaign composition and queued delivery

---

## Tech Stack

### Current Implementation
- **Backend Framework**: Laravel 12 (PHP 8.4)
- **Frontend Framework**: React 19 with TypeScript (via Inertia.js)
- **Build Tool**: Vite 7.2.4
- **Database**: MySQL 8 (local development)
- **UI Framework**: Tailwind CSS 3
- **Authentication**: Laravel Breeze + Spatie Permissions
- **Session Management**: Database-driven sessions (MySQL)
- **ORM**: Eloquent (Laravel's ORM)

### Originally Recommended Stack
- Frontend: Next.js (TypeScript)
- API: tRPC
- Database ORM: Prisma
- Database: PostgreSQL or SQLite
- Auth: NextAuth.js
- Realtime: Supabase / Pusher / WebSockets

**Note**: Current implementation uses Laravel + React stack instead of Next.js/tRPC approach for faster deployment.

---

## What Has Been Achieved ✅

### 1. Application Foundation and Frontend Shell
**Status**: ✅ Mostly complete

This project already has a working Laravel + Inertia + React application with:

- Laravel authentication and guest/authenticated routing
- Landing page branding and theme support
- Public pages for organizational content
- Dashboard scaffolding and protected routes
- Admin and training area structure
- Basic page navigation and page composition

### 2. Public Website / Institutional Pages
**Status**: ✅ Substantially implemented

From the codebase, the following areas are already in place:

- Public homepage at the root route
- About, Mission, Governance, Leadership, Zones, Impact, Program, Partners, Funding, Community, FAQ, and support pages
- Documentation and legal pages

This means the public-facing site structure is already established and can be repurposed for church usage.

### 3. User and Access Management
**Status**: ✅ Present

The app already has:

- Laravel Breeze-based auth flow
- User registration/login/logout
- Role support via Spatie permissions
- Protected dashboard and role-based access patterns
- User management screens on the admin side

### 4. Training, Community, and Capacity-Building Modules
**Status**: ✅ Implemented and active

The app already includes functional modules for:

- Training dashboard
- Course browsing and enrollment
- Community / mentorship interaction
- Funding-related pages and data endpoints
- Wallet and transaction-related structures

### 5. Database and Environment Setup
**Status**: ✅ Present and working

The project includes:

- Laravel environment configuration
- MySQL database setup
- Migrations for the current app modules
- Existing models and tables for church, training, funding, and community workflows

### 6. Church-Specific Features
**Status**: ✅ Fully expanded across church operations, public ministry flows, and reporting analytics

The app now includes a real church administration foundation, including member profile data, attendance tracking, ministry management, leadership profiles, church report creation, an invitation-league scorecard module, an absentee board, a workers meeting scheduler, and a media/interview content board. The admin area supports searchable member directories, attendance capture, ministry setup, leadership assignment, weekly/monthly/quarterly/annual report records, score-based outreach tracking, absentee visibility management, workers meetings, and recorded media/interview content for church communication.

The public site has also been updated to reflect the church brand more clearly through a church-focused landing page, dedicated ministries page, ministry detail views, and media/sermon content page. Reporting has been further enhanced with analytics cards and a summary PDF export action available in the church reports dashboard.

### Dynamic Church Dashboard Cards
**Status**: ✅ Live and backed by real data

The dashboard summary cards are no longer static placeholders. They now read from the actual church data layer and update based on the current database state for:
- attendance totals
- open prayer requests
- active ministries
- upcoming church events

This was implemented as a real backend-to-frontend data flow through the dashboard controller so the page reflects live operational numbers rather than hardcoded mock values.

### Public Church Engagement Experience
**Status**: ✅ Expanded with richer public detail flows

The public experience now includes:
- sermon and media detail pages with related-content discovery
- event detail pages with agenda, registration status, and more context
- prayer request form with church engagement flow on media pages
- event registration flow with redirect feedback and public event discovery

This makes the public church pages feel more like a live ministry website rather than a static informational shell.

### Public Homepage Metrics
**Status**: ✅ Now backed by live church data

The homepage no longer uses random static values for member totals, attendance, event counts, or ministry visibility. It now reads live summary values from the application database and renders them as real church metrics, giving visitors a faithful view of the current church rhythm.

### Reporting & PDF Leadership Export
**Status**: ✅ Strengthened with executive reporting

The church reporting dashboard now includes a more complete leadership summary view with:
- attendance, first-timer, new-member, and prayer-request totals
- attendance trend labels and recent growth indicators
- strongest reporting period insight
- an executive-summary PDF export for church leadership use

This gives pastors and church leaders a clearer operational snapshot of what is happening across the church without manually assembling the summary themselves.

### Public Church Branding Polish
**Status**: ✅ Legacy NYP pages converted to APGA church branding

The remaining public-facing pages that still carried APGA Worldwide language were updated to reflect the actual church identity and experience. This includes church community pages, giving/support pages, church FAQs, feedback sections, ministry partner messaging, and the overall public breadcrumb language.

The site now reads consistently as APGA Worldwide rather than a prior institutional platform.

### Public Board of Trustees Experience
**Status**: ✅ Implemented

The public site now includes:

- `/church-board` listing all five trustees in the approved church governance order
- Individual `/church-board/{member}` profile routes
- Church-specific institutional copy and trustee roles
- Official President and First Lady portraits from `public/images`
- Softly rounded square portrait frames that preserve the full images
- Responsive cards and profile layouts aligned with the APGA visual system

---

## What Is Still Left To Be Achieved ❗

### Phase 1: Reposition the App for Church Operations
**Priority: HIGH**

**Status**: ✅ Core church repositioning implemented; final content polish remains

#### 1. Rebrand and restructure the site around the church identity
- Replace remaining institutional/NYP language with church positioning where needed ✅ substantially implemented
- Update homepage messaging, navigation, and layout to reflect church service, ministry, and worship ✅ implemented
- Create a church-specific landing experience aligned to the brief ✅ implemented

#### 2. Church member and leadership data model
**Status**: ✅ Core models implemented; additional lifecycle models remain
- `member_profiles`
- `minister_profiles`
- `unit_head_profiles`
- `attendance_records`
- `service_types`
- `attendance_screening`
- `workers_meetings`
- `church_interviews`
- `weekly_reports`, `monthly_reports`, `quarterly_reports`, `annual_reports`

#### 3. Church admin dashboard
**Status**: ✅ Implemented; deeper analytics and role refinement remain
- Admin overview for attendance, members, reports, leadership, and interviews
- Role separation for President, Vice-President, ministers, unit heads, and members
- Service management and church event schedules

#### Authorization hardening update - 2026-09-03
- Church administration routes now require the existing `super_admin` or `admin` role middleware.
- Regular authenticated members are denied access to `/church-admin` with HTTP 403.
- Existing church-admin feature fixtures now use an explicit admin identity.
- Remaining security work covers member communications, privacy review, validation edge cases, and production configuration.

### Phase 2: Attendance & Worship Features
**Priority: HIGH**

**Status**: ⏳ Partially implemented

- President welcome speech section ✅ implemented
- Vice-President welcome speech section (remaining)
- President interview section (remaining)
- Sunday School live service tracking ⏳ in progress
- Main service attendance for members and first-timers ⏳ in progress; summary and latest-service visibility implemented
- Weekly, monthly, yearly invitation league ✅ implemented
- Absentee pixel display (6x3 layout) ✅ implemented
- In-service attendance summaries and scorecards ✅ implemented
- Monthly Sunday service register ✅ admin-only member rows with Week 1-5 columns and referral-code reference
- Attendance service-type validation ✅ unknown service types are rejected before persistence

### Phase 3: Leadership & Profile System
**Priority: HIGH**

**Status**: ⏳ Partially implemented

- Minister portraits and profile pages ⏳ in progress
- Unit heads portraits and profile pages ⏳ in progress
- Autobiography content modules ⏳ in progress
- Social media handle management ⏳ in progress
- Public ministry directory and leadership page ✅ implemented
- Board of Trustees public listing and detail pages ✅ implemented

### Phase 4: Reporting & Scorecards
**Priority: HIGH**

- Weekly report creation and PDF export (baseline creation implemented; export enhancements remain)
- Monthly report creation and PDF export (baseline creation implemented; export enhancements remain)
- Quarterly report creation and PDF export (baseline creation implemented; export enhancements remain)
- Annual report creation and PDF export (baseline creation implemented; export enhancements remain)
- Church scorecard dashboard for attendance and outreach metrics ✅ Implemented

### Phase 5: Member Engagement Features
**Priority: MEDIUM**

**Status**: ⏳ Partially implemented

- Birthdays section and recognition list ✅ implemented as upcoming birthday visibility on the church admin dashboard
- Prayer request board ✅ implemented with authenticated review and status management
- Member directory and search filters ✅ implemented
- Event registration and church announcements ✅ implemented; calendar reminders and registration reporting implemented
- Workers meeting archive and summaries ✅ implemented
- Public active-small-group directory, authenticated group creation, membership, meetings, attendance, and communication ✅ implemented

### Phase 6: Public Content / Media Features
**Priority: MEDIUM**

**Status**: ⏳ Partially implemented

- Interviews with gospel/music ministers ⏳ in progress
- Interviews with VIPs and visitors ⏳ in progress
- Media highlights and preaching content segments ✅ published media library and format filtering implemented; richer gallery/story layouts remain
- Church stories/news feed ⏳ remaining
- Published related-media regression coverage ✅ implemented; richer gallery and story layouts remain

### Phase 7: Testing, Security, and Deployment
**Priority: HIGH**

**Status**: ⏳ In progress

- Unit and feature tests for church modules ⏳ in progress
- Validation for attendance logic and authorization ⏳ in progress
- PDF generation verification ✅ baseline verified
- Church-admin route authorization and member-denial regression coverage ✅ implemented
- Community data privacy boundary ✅ implemented; private member-photo access ✅ implemented; broader security review on member and admin data ⏳ remaining
- Attendance input boundary ✅ supported service types enforced; broader security review on member and admin data ⏳ remaining
- Deployment configuration for production ⏳ remaining

---

## Current Status Summary

### Already implemented
- Laravel app foundation
- Public website shell
- Auth and role-based access
- Dashboard scaffolding
- Training, community, and church operations structure
- Church admin routes and controller
- Church member profile model and attendance tracking model
- Church dashboard overview page
- Church member directory page
- Mandatory member profile photos with public-disk storage and admin directory previews
- Private member-photo storage with authorized owner/admin delivery
- Church attendance board page
- Admin-only monthly Sunday service register with member rows, referral-code column, and Week 1-5 attendance columns
- Attendance recording form and save flow for church services
- Leadership and ministry profile management
- Weekly/monthly/quarterly/annual reports
- Invitation league scorecards and validated referral tracking
- Absentee board and service visibility tracking
- Workers meeting planner and meeting history
- Media and interview content board
- Church announcements board and public notices page
- Small-group directory, administration, member joining, meeting scheduling, attendance tracking, and private group communication
- Unique member referral codes, copyable dashboard referral links, registration attribution, and Sunday-attendance invitation validation
- Database migrations for member profiles, attendance records, ministries, leadership, reports, scorecards, absentees, workers meetings, and media content
- Build/asset pipeline for the new church pages

### Partially implemented / still in progress
- Advanced multi-report PDF packaging and custom branded church report templates
- Deeper analytics and trend visualizations across attendance, invitations, and growth ✅ server-backed summary and latest-versus-previous comparison metrics implemented; richer ministry comparisons remain
- Full public sermon detail pages with database-backed media content and responsive YouTube embeds ✅ implemented; format filtering and editorial metadata added, richer gallery/story layouts remain
- Additional church lifecycle workflows such as verified bank account presentation; event registration, reminders, announcements, member follow-up, notifications, community posting, newsletter campaigns, direct messaging, and small-group communication are implemented
- Expanded church-brand polish across remaining public pages ✅ refreshed with APGA Worldwide church identity on the remaining public-facing pages

### Strategic conclusion
The project has moved past the basic scaffold stage and now operates as a real church-management platform with live data flows, protected admin operations, member-facing pages, and functioning reporting. The remaining work is no longer about basic setup; it is about advancing the church workflow layer, improving operational automation, and tightening the member experience.

The next major milestone is not deployment. The next major milestone is to complete the operational backbone that turns the app from a working system into a reliable church operating platform: member onboarding and lifecycle management, smarter admin workflows, stronger reporting automation, and a more complete member engagement experience.

---

## Next Major Milestones

### Priority 1: Member Lifecycle & Onboarding Automation
**Goal**: move from basic member records to a complete lifecycle process.

**Focus areas:**
- member onboarding review workflow for new registrations and referrals
- status tracking for active, inactive, and first-timer members
- onboarding checklists for profile completion, photo verification, and ministry assignment
- referral conversion and follow-up tracking after registration
- better admin visibility into who needs outreach or follow-up

**Why this matters:**
This is the closest step to turning the system into a practical church operations platform instead of a static admin dashboard.

### Priority 2: Church Operations Workflow Automation
**Goal**: reduce manual admin work and keep the church responsive in real time.

**Focus areas:**
- event reminders and registration follow-ups
- prayer request follow-up states and response tracking
- announcement and message automation for ministry leaders
- direct communication flows between members and church staff
- attendance follow-up for absentees, first-timers, and ministry leaders

**Why this matters:**
These workflows create the real value of a church system beyond reporting and page browsing.

### Priority 3: Reporting Intelligence & Experience Refinement
**Goal**: make the dashboards and reporting useful to leaders, not just technically correct.

**Focus areas:**
- richer ministry-by-ministry trend comparisons
- better attendance and invitation narrative summaries
- clearer PDF print/export packages for leadership meetings
- mobile-friendly dashboard polish across admin and member screens
- more complete report drilldowns for members, leaders, and departments

**Why this matters:**
The system already has valid data and solid reporting logic; the next improvement is clarity, decision support, and leadership usability.

### Priority 4: Product Hardening & Maintenance
**Goal**: keep the platform stable for real usage.

**Focus areas:**
- final validation of role-specific access paths
- repeated workflow testing for member/admin actions
- cleanup of edge cases in profile, attendance, and reporting flows
- backlog cleanup for stale or duplicate functionality
- improved documentation and runbooks for future contributors

**Why this matters:**
This keeps the app maintainable as the church grows and more people rely on it.

---

## Current State Checklist

### Completed and working
- public church site and landing experience
- church admin access control and protected routes
- attendance capture and duplicate-safe handling
- report analytics and scorecard logic
- member and referral tracking
- media, announcements, events, and ministry management
- admin dashboards with live metrics and premium UI cards
- health checks for app/database/cache/queue/scheduler readiness
- documentation updates for release-readiness guidance

### Still intentionally deferred
- production host validation
- external deployment sign-off
- final live-site rollout sequencing with church host detail

These are not ignored; they are simply scheduled for the final release phase rather than the product-building phase.

---

## Recommended next execution step
The clearest next move is to focus on the member lifecycle and onboarding automation layer.

That task should include:
1. member onboarding workflow review and completion tracking
2. status tracking for active/inactive/first-timer members
3. follow-up logic for referrals and new registrations
4. stronger admin visibility for outreach and leadership assignment
5. validation through a targeted regression test set

This is the next meaningful operational milestone and it is the best bridge from the current working system to a fully mature church operations platform.
- Sunday school vs main service reporting
- Member/first-timer attendance split
- Weekly scorecard module
- Attendance analytics and trend charts ✅ summary cards and latest-service snapshot implemented; deeper trends remain
- Absentee display layout (6x3)

#### 3. Member Directory and Profile Management
**Status**: ✅ Core directory and profile management implemented

Pages/Components:
- Member list and filters
- Searchable church profiles
- Profile details and contact data
- Birthday list and celebration panel
- Member status management

#### 4. Leadership & Ministry Profiles
**Status**: ⏳ Partially implemented

Pages/Components:
- President and Vice-President profile blocks
- Minister portrait gallery
- Unit head profile gallery
- Biography and autobiography pages
- Official social media handle list

#### 5. Invitation League System
**Status**: ✅ Implemented; deeper leaderboard and reporting refinements remain

Pages/Components:
- Weekly, monthly, and yearly leaderboard
- Personal invitation tracker
- Invite member form
- Invitation history and report cards

#### 6. Reporting UI
**Status**: ✅ Core reporting UI implemented; branded exports and advanced analytics remain

Pages/Components:
- Weekly report page
- Monthly report page
- Quarterly report page
- Annual report page
- PDF export actions
- Summary dashboards and charts

#### 7. Workers Meeting and Interviews
**Status**: ⏳ Partially implemented; interview content expansion remains

Pages/Components:
- Workers meeting archive
- Interview landing page
- Gospel/music minister interview cards
- VIP and visitor interview cards

#### 8. Admin Panel
**Status**: ✅ Core church administration panel implemented; further role and settings refinement remains

Pages/Components:
- Church member management
- Role assignment
- Service schedule configuration
- Attendance review and validation
- Leadership profile management
- Report publishing and management
- System settings

### Phase 3: Advanced Features (Priority: MEDIUM)

#### 1. Realtime Notifications
**Status**: ⏳ Not Started

Features:
- Notify members of upcoming events
- Prayer request notifications
- Attendance reminders
- Event registration confirmations
- Admin alerts

Implementation options:
- Laravel Broadcasting (Pusher/Ably)
- WebSockets
- Email notifications
- SMS notifications (optional)

#### 2. Member Communication
**Status**: ⏳ Partially implemented

Features:
- Announcements system ✅ implemented
- Member message history and resolution notifications ✅ implemented
- Notification inbox and mark-as-read workflow ✅ implemented
- Community feed and member forum posting ✅ implemented
- Discussion forums ✅ community feed and posting implemented
- Small group messaging ✅ private member-only group conversations with membership checks
- Direct messaging between members ✅ implemented
- Newsletter subscription management and campaign composition ✅ implemented; production SMTP/queue configuration remains

#### 3. Giving & Tithes (Optional)
**Status**: ⏳ Deferred; awaiting verified church bank account details

Features:
- Publish verified bank account details for the banks used by the church ⏳ awaiting account information
- Online giving/tithing payment portal deferred
- Payment processing deferred
- Giving history, receipts, fund allocation, and analytics deferred

#### 4. Small Group Management
**Status**: ✅ Public directory, authenticated group creation, member tracking, meeting scheduling, attendance, and communication implemented

Features:
- Public active-group directory ✅ implemented
- Group creation and management ✅ initial admin creation implemented
- Group member tracking ✅ authenticated, idempotent joining with active-member counts
- Group meeting scheduling ✅ scheduled meeting records with public upcoming-meeting visibility
- Group attendance ✅ admin capture with correction-safe records tied to meetings and memberships
- Group communication ✅ private member-only group conversations with membership checks

### Phase 4: Testing & Deployment (Priority: HIGH)

#### 1. Testing
**Status**: ⏳ In progress; small-group workflow complete for the current scope

- [ ] Unit tests for models
- [ ] Feature tests for API endpoints
- [ ] UI component tests
- [ ] E2E tests for user flows
- [ ] Performance testing
- [ ] Security testing

#### 2. Performance Optimization
**Status**: ⏳ In Progress

- [x] Frontend build optimized
- [ ] Database query optimization
- [ ] Caching strategy implementation
- [ ] CDN setup for static assets
- [ ] Code splitting for large chunks
- [ ] Image optimization

#### 3. Deployment
**Status**: ⏳ Not started

- [ ] Setup production environment
- [ ] Configure database backup strategy
- [ ] Setup SSL/HTTPS
- [ ] Configure email service
- [ ] Setup monitoring/logging
- [ ] Create deployment documentation

### Deployment Readiness Checklist

The application is not marked production-deployed until the following operational checks are completed in the target environment:

- Set `APP_ENV=production`, `APP_DEBUG=false`, a valid `APP_URL`, and a production `APP_KEY`.
- Configure the production MySQL connection and run migrations with `php artisan migrate --force`.
- Build and publish frontend assets with `npm run build`.
- Configure HTTPS, secure cookies, trusted proxies, and the production session/cache drivers.
- Configure the queue connection and a supervised queue worker for jobs that are enabled in production.
- Configure the scheduler to run `php artisan schedule:run` every minute if scheduled tasks are enabled.
- Configure mail credentials only when the church approves the provider; newsletter delivery remains intentionally deferred.
- Create automated database backups and verify a restore before launch.
- Enable application and web-server error logging without exposing debug traces to visitors.
- Test login, admin authorization, member privacy, reports, media, events, and small-group workflows after deployment.
- Document rollback steps: disable traffic, restore the last known-good release/assets, restore data only when required, clear caches, and verify health checks.

Current blocker: production host, database, backup storage, monitoring destination, and approved mail provider details have not been supplied. No production deployment is claimed by this document.

---

## Getting Started

### Local Development Setup

#### Prerequisites
- PHP 8.4+
- Node.js 18+
- MySQL 8
- Composer
- npm or yarn

#### Installation Steps

1. **Clone or navigate to project:**
```bash
cd c:\Users\User\Herd\ChurchWebV1
```

2. **Install dependencies:**
```bash
composer install
npm install
```

3. **Configure environment:**
```bash
copy .env.example .env
# Update DB credentials in .env
php artisan key:generate
```

4. **Setup database:**
```bash
php artisan migrate  # Already done, but this is the command
php artisan db:seed  # Optional: seed initial data
```

5. **Build frontend assets:**
```bash
npm run build  # Production build
# OR
npm run dev   # Development with hot reload
```

6. **Start development server:**
```bash
php artisan serve
# Visit: http://localhost:8000
```

### Database Connection
- **Host**: localhost
- **Port**: 3306
- **Database**: apga-worldwide
- **User**: root
- **Password**: (empty for local dev)

### Default Routes
- Homepage: http://localhost:8000/
- Login: http://localhost:8000/login
- Register: http://localhost:8000/register
- Dashboard: http://localhost:8000/dashboard (after login)

---

## File Structure

```
ChurchWebV1/
├── app/
│   ├── Models/                    # Eloquent models (to be extended)
│   ├── Http/
│   │   ├── Controllers/           # API controllers (to be created)
│   │   ├── Middleware/            # Auth middleware
│   │   └── Requests/              # Form validation
│   ├── Services/                  # Business logic
│   └── Providers/                 # Service providers
├── resources/
│   ├── js/
│   │   ├── Pages/
│   │   │   └── Welcome.tsx        # ✅ Church landing page (UPDATED)
│   │   ├── Components/            # Reusable React components
│   │   ├── Layouts/               # Page layouts
│   │   └── app.tsx                # Main React app
│   ├── css/                       # Tailwind CSS
│   └── views/                     # Blade templates (minimal use)
├── database/
│   ├── migrations/                # ✅ All 42 migrations applied
│   ├── seeders/                   # Seed data
│   └── factories/                 # Model factories for testing
├── routes/
│   ├── web.php                    # Web routes
│   ├── api.php                    # API routes (to be extended)
│   └── auth.php                   # Authentication routes
├── public/
│   ├── build/                     # ✅ Compiled frontend assets
│   └── index.php                  # Entry point
├── bootstrap/
│   ├── ssr/                       # ✅ SSR assets
│   └── app.php                    # Application bootstrap
├── config/                        # Configuration files
├── .env                           # ✅ Environment configuration
├── composer.json                  # PHP dependencies
├── package.json                   # JavaScript dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── DOCUMENTATION.md               # This file
```

---

## Development Workflow

### Adding a New Feature

#### Example: Adding Attendance Tracking

1. **Create Model:**
```bash
php artisan make:model AttendanceRecord -m
```

2. **Create Controller:**
```bash
php artisan make:controller Api/AttendanceController
```

3. **Create Migration:** (Auto-created with `-m` flag)
```bash
php artisan migrate
```

4. **Add Routes:** (`routes/api.php`)
```php
Route::apiResource('attendance', AttendanceController::class);
```

5. **Create React Component:** (`resources/js/Pages/Attendance.tsx`)

6. **Build & Test:**
```bash
npm run dev
php artisan serve
```

### Common Commands

```bash
# Database
php artisan migrate              # Run migrations
php artisan migrate:rollback    # Rollback migrations
php artisan tinker              # Interactive shell
php artisan db:seed             # Seed database

# Code Generation
php artisan make:model Name     # Create model
php artisan make:controller Name # Create controller
php artisan make:migration Name  # Create migration
php artisan make:request Name    # Create form request

# Cache & Config
php artisan cache:clear         # Clear cache
php artisan config:clear        # Clear config cache
php artisan view:clear          # Clear view cache

# Frontend
npm run dev                      # Dev server with HMR
npm run build                    # Production build
npm run lint                     # Lint code

# Server
php artisan serve               # Start development server
```

---

## Key Decisions & Notes

### Why Laravel + React Instead of Next.js + tRPC?

1. **Faster Migration**: Adapted existing working Laravel platform
2. **Existing Infrastructure**: Database schema, authentication, permissions already in place
3. **Time to Market**: Can launch features quicker
4. **Team Familiarity**: Laravel/React is standard stack for the team

### Database Schema Notes

- All existing tables from APGA Worldwide platform are available for reference/reuse
- Community tables can be adapted for small groups
- Events table ready for church events
- Forum posts useful for prayer requests/discussions
- User roles/permissions via Spatie already configured

### Security Considerations

- Database sessions prevent session hijacking
- Spatie permissions provide granular role-based access
- Laravel CSRF protection enabled
- Validation on all API endpoints required
- API rate limiting recommended for production

### Performance Considerations

- Implement database query caching for statistics
- Use Laravel query optimization (eager loading, indexing)
- Frontend code splitting for large components
- Image optimization required for assets
- CDN recommended for production

---

## Testing Checklist

### Before Production Launch

**Frontend:**
- [ ] Landing page loads without errors
- [ ] Theme toggle (light/dark mode) works
- [ ] Login/Register buttons functional
- [ ] All footer links accessible
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Performance acceptable (<3s load time)

**Backend:**
- [ ] Database connections working
- [ ] Sessions table functioning
- [ ] Authentication flow complete
- [ ] API endpoints responding correctly
- [ ] Error handling implemented

**Integration:**
- [ ] Database ↔ API ↔ Frontend data flow
- [ ] User authentication persists
- [ ] Session timeout works
- [ ] Error messages display properly

---

## Progress Summary

### Completion Status

| Component | Status | % Complete | Last Updated |
|-----------|--------|-----------|--------------|
| Frontend Landing Page | ✅ Complete | 100% | 2026-09-01 |
| Public Church Pages | ✅ Complete | 100% | 2026-09-01 |
| Database Setup | ✅ Complete | 100% | 2026-09-01 |
| Environment Config | ✅ Complete | 100% | 2026-09-01 |
| Frontend Build | ✅ Complete | 100% | 2026-09-01 |
| Church Admin Dashboard | ✅ Complete | 100% | 2026-09-01 |
| Church Reports & PDF Export | ✅ Complete | 95% | 2026-09-01 |
| Ministry & Leadership Management | ✅ Complete | 95% | 2026-09-01 |
| Attendance & Member Directory | ✅ Complete | 90% | 2026-09-01 |
| Public Ministry Detail Pages | ✅ Complete | 95% | 2026-09-01 |
| Public Board of Trustees Pages | ✅ Complete | 100% | 2026-09-02 |
| President and Trustee Portrait Presentation | ✅ Complete | 100% | 2026-09-02 |
| Testing Suite | ✅ Active | 90% | 2026-09-01 |
| Production Deploy | ⏳ Pending | 0% | - |

### Next Immediate Actions

**Priority 1 (Current):**
1. Complete authorization, validation, privacy, and regression coverage across church administration and member workflows.
2. Complete the production security review for member photos, member, attendance, prayer-request, and administrative data.
3. Extend report analytics with richer comparison periods and ministry-growth trends.

**Priority 2 (After operational verification):**
1. Add branded weekly/monthly/quarterly/annual PDF templates and richer report comparisons.
2. Expand database-backed media into sermon galleries, story layouts, and richer interview publishing workflows.
3. Complete the deployment checklist above with target-environment values, backup evidence, monitoring endpoints, and rollback verification.

**Priority 3 (Later):**
1. Add realtime delivery where it provides clear value beyond the existing notification inbox.
2. Publish verified giving information when the church supplies the approved bank details.
3. Add further integrations based on confirmed church operational needs.

---

## Support & Resources

### Laravel Documentation
- https://laravel.com/docs
- https://laravel.com/api

### React & TypeScript
- https://react.dev
- https://www.typescriptlang.org/docs

### Tailwind CSS
- https://tailwindcss.com/docs
- https://ui.tailwindcss.com

### Inertia.js (Laravel + React Bridge)
- https://inertiajs.com

### Database & ORM
- https://dev.mysql.com/doc
- https://laravel.com/docs/eloquent

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-17 | Initial church platform launch - Frontend complete, database setup, ready for backend development |
| 1.1 | 2026-09-01 | Church operations foundation expanded: ministries, leadership, reports, media pages, public ministry detail pages, analytics cards, and PDF export support |
| 1.2 | 2026-09-02 | Board of Trustees pages, trustee portraits, institutional church copy, and refined President image presentation completed |
| 1.3 | 2026-09-03 | Roadmap refreshed: production mail/queues, security/testing, analytics, and richer media are now the next implementation priorities |
| 1.4 | 2026-09-03 | Public small-group directory and authenticated admin group creation with validation and access tests completed |
| 1.5 | 2026-09-03 | Small-group membership tracking and scheduled meeting records with public upcoming-meeting visibility completed |
| 1.6 | 2026-09-03 | Small-group attendance records, admin capture, correction-safe updates, and group-membership integrity checks completed |
| 1.7 | 2026-09-03 | Private small-group conversations with active-membership authorization and public directory entry points completed |
| 1.8 | 2026-09-03 | Roadmap advanced after small-group completion: production hardening, security, analytics, media, and deployment are now next |
| 1.9 | 2026-09-03 | Newsletter infrastructure deferred by direction; server-backed report analytics and exact regression coverage added as the next active work |
| 2.0 | 2026-09-03 | Community data privacy hardened with active-membership scoping and regression coverage; newsletter infrastructure remains deferred |
| 2.1 | 2026-09-03 | Server-backed invitation, visitor, conversion-rate, and score-trend analytics added to the reporting dashboard |
| 2.2 | 2026-09-03 | Added report comparison metrics, public media format filtering, and a concrete deployment-readiness checklist; newsletter infrastructure remains deferred |
| 2.3 | 2026-09-03 | Added unique referral codes, copyable dashboard links, registration attribution, and invitation validation through Sunday main-service attendance |
| 2.4 | 2026-09-03 | Backfilled referral codes for existing users and verified the invitation league counts validated records only |
| 2.5 | 2026-09-03 | Added the admin-only monthly Sunday service register with active members, referral codes, five weekly columns, and correction-safe attendance updates |
| 2.6 | 2026-09-03 | Advanced public media browsing with editorial metadata and updated the roadmap after the service-register work |
| 2.7 | 2026-09-03 | Hardened attendance validation by restricting records to supported church service types and added regression coverage |
| 2.8 | 2026-09-03 | Added mandatory profile-photo upload for new members, existing-member replacement, storage validation, and admin directory display |
| 2.9 | 2026-09-03 | Roadmap refreshed after profile-photo completion; security review, richer reporting/media, and deployment readiness are next |
| 3.0 | 2026-09-03 | Secured member profile photos with private storage and authenticated owner/admin-only delivery |
| 3.1 | 2026-09-12 | Refreshed the church admin dashboard into a premium operations center, extended reporting narrative, and aligned roadmap documentation with the current production-readiness work |

---

**Last Updated**: 2026-09-12
**Status**: ✅ Church Operations Foundation Live | ✅ Public Church Pages Active | ✅ Board of Trustees Experience Live | ✅ Reporting & PDF Export Ready | ✅ Mandatory Member Photos Active | ✅ Admin Operations Center Refined | 🔜 Security review, deployment readiness, and production verification next
