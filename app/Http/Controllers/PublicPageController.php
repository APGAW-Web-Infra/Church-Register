<?php

namespace App\Http\Controllers;

use App\Models\ChurchMediaContent;
use App\Models\ChurchAnnouncement;
use App\Models\ChurchMinistry;
use App\Models\ChurchContactMessage;
use App\Models\ChurchPrayerRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\SmallGroup;
use App\Models\SmallGroupMembership;
use App\Models\SmallGroupMeeting;
use App\Models\SmallGroupMessage;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    private function boardTrustees(): array
    {
        return [
            [
                'slug' => 'prophet-dr-samuel-olugbenga-ilesanmi',
                'name' => 'Prophet (Dr.) Samuel Olugbenga Ilesanmi',
                'role' => 'Chairman, Board Of Trustees',
                'title' => 'Chairman, Board Of Trustees',
                'summary' => 'A spiritual father and visionary servant-leader guiding the church in prayer, unity, and apostolic direction.',
                'biography' => 'Prophet (Dr.) Samuel Olugbenga Ilesanmi is the spiritual leader and chairman of the Board of Trustees. He is known for his prayerful leadership, pastoral wisdom, and unwavering commitment to the spiritual growth, unity, and mission of APGA Worldwide.',
                'experience' => '20+ Years of Spiritual Leadership',
                'email' => 'chairman@apga.org',
                'phone' => 'Available upon request',
                'linkedin' => '#',
                'twitter' => '#',
                'areas' => ['Spiritual Leadership', 'Church Governance', 'Discipleship', 'Vision Casting'],
                'education' => [
                    ['degree' => 'Doctorate in Theology', 'school' => 'APGA Spiritual Leadership Institute', 'year' => '2010 - 2014'],
                ],
                'avatar' => ['image' => 'President_GO.jpeg', 'gradients' => 'from-violet-600 to-indigo-700', 'initials' => 'SO'],
            ],
            [
                'slug' => 'evangelist-mrs-esther-omobolanriwa-ilesanmi',
                'name' => 'Evangelist (Mrs.) Esther Omobolanriwa Ilesanmi',
                'role' => 'Member, Board Of Trustees',
                'title' => 'Member, Board Of Trustees',
                'summary' => 'A devoted minister and prayer warrior committed to discipleship, outreach, and spiritual nurture within the church.',
                'biography' => 'Evangelist (Mrs.) Esther Omobolanriwa Ilesanmi is a committed servant of God whose life reflects prayer, compassion, and deep spiritual conviction. She contributes to the church through mentoring, spiritual care, and a strong passion for evangelism and discipleship.',
                'experience' => '18+ Years of Ministry',
                'email' => 'esther.ilesanmi@apga.org',
                'phone' => 'Available upon request',
                'linkedin' => '#',
                'twitter' => '#',
                'areas' => ['Women’s Ministry', 'Prayer', 'Outreach', 'Mentorship'],
                'education' => [
                    ['degree' => 'Diploma in Christian Education', 'school' => 'APGA Ministry College', 'year' => '2008 - 2011'],
                ],
                'avatar' => ['image' => 'Firstlady.jpeg', 'gradients' => 'from-cyan-600 to-sky-700', 'initials' => 'EI'],
            ],
            [
                'slug' => 'elder-daniel-ayomide-ilesanmi',
                'name' => 'Elder Daniel Ayomide Ilesanmi',
                'role' => 'Member, Board Of Trustees',
                'title' => 'Member, Board Of Trustees',
                'summary' => 'A faithful elder whose leadership reflects discipline, service, and spiritual accountability in the church community.',
                'biography' => 'Elder Daniel Ayomide Ilesanmi brings wisdom, structure, and humility to the Board of Trustees. His life of service supports the church’s focus on unity, obedience, discipleship, and practical stewardship in every sphere of ministry.',
                'experience' => '12+ Years of Service',
                'email' => 'daniel.ilesanmi@apga.org',
                'phone' => 'Available upon request',
                'linkedin' => '#',
                'twitter' => '#',
                'areas' => ['Stewardship', 'Administration', 'Discipleship', 'Leadership Development'],
                'education' => [
                    ['degree' => 'Bachelor of Science in Business Administration', 'school' => 'APGA Leadership Academy', 'year' => '2011 - 2015'],
                ],
                'avatar' => ['gradients' => 'from-amber-500 to-orange-600', 'initials' => 'DI'],
            ],
            [
                'slug' => 'overseer-anthony-adebayo-olayinka',
                'name' => 'Overseer Anthony Adebayo Olayinka',
                'role' => 'Member, Board Of Trustees',
                'title' => 'Member, Board Of Trustees',
                'summary' => 'A committed church leader supporting pastoral care, spiritual oversight, and service to the church family.',
                'biography' => 'Overseer Anthony Adebayo Olayinka is a dedicated servant of God whose leadership reflects pastoral compassion, oversight, and commitment to church growth. His involvement strengthens the board’s focus on spiritual care, unity, and member development.',
                'experience' => '15+ Years of Church Leadership',
                'email' => 'anthony.olayinka@apga.org',
                'phone' => 'Available upon request',
                'linkedin' => '#',
                'twitter' => '#',
                'areas' => ['Pastoral Care', 'Church Oversight', 'Discipleship', 'Community Service'],
                'education' => [
                    ['degree' => 'Bachelor of Arts in Theology', 'school' => 'APGA Leadership Seminary', 'year' => '2006 - 2010'],
                ],
                'avatar' => ['gradients' => 'from-rose-600 to-red-700', 'initials' => 'AO'],
            ],
            [
                'slug' => 'engr-oludayo-amele',
                'name' => 'Engr. Oludayo Amele',
                'role' => 'Secretary, Board Of Trustees',
                'title' => 'Secretary, Board Of Trustees',
                'summary' => 'A strategic administrator and governance steward supporting effective communication, records, and church coordination.',
                'biography' => 'Engr. Oludayo Amele serves as the secretary of the Board of Trustees, providing faithful administrative leadership, accurate documentation, and structured support for the board’s governance and church operations.',
                'experience' => '10+ Years in Governance and Administration',
                'email' => 'secretary@apga.org',
                'phone' => 'Available upon request',
                'linkedin' => '#',
                'twitter' => '#',
                'areas' => ['Governance', 'Administration', 'Planning', 'Documentation'],
                'education' => [
                    ['degree' => 'Bachelor of Engineering', 'school' => 'Federal University of Technology', 'year' => '2009 - 2014'],
                ],
                'avatar' => ['gradients' => 'from-teal-500 to-cyan-600', 'initials' => 'OA'],
            ],
        ];
    }

    // About church pages
    public function about()
    {
        return Inertia::render('Public/About', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function leadership()
    {
        return Inertia::render('Public/Leadership', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function churchBoard()
    {
        return Inertia::render('Public/ChurchBoard', [
            'laravelVersion' => Application::VERSION,
            'trustees' => $this->boardTrustees(),
        ]);
    }

    public function churchBoardDetail(string $member)
    {
        $trustees = $this->boardTrustees();
        $trustee = collect($trustees)->firstWhere('slug', $member);

        if (! $trustee) {
            abort(404, 'Board member not found.');
        }

        return Inertia::render('Public/ChurchBoardDetail', [
            'laravelVersion' => Application::VERSION,
            'trustee' => $trustee,
            'trustees' => $trustees,
        ]);
    }

    public function governance()
    {
        return Inertia::render('Public/Governance', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function mission()
    {
        return Inertia::render('Public/Mission', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function churchHistory()
    {
        return Inertia::render('Public/ChurchHistory', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    // APGA Worldwide Program Pages
    public function program()
    {
        return Inertia::render('Public/Program', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function partners()
    {
        return Inertia::render('Public/Partners', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function smallGroups(Request $request)
    {
        $smallGroupsTableExists = Schema::hasTable('small_groups');
        $smallGroupMembershipsTableExists = Schema::hasTable('small_group_memberships');
        $smallGroupMeetingsTableExists = Schema::hasTable('small_group_meetings');

        $groups = [];

        if ($smallGroupsTableExists) {
            $query = SmallGroup::query()->where('is_active', true)->orderBy('name');

            if ($smallGroupMembershipsTableExists) {
                $query->withCount(['memberships as active_member_count' => fn ($query) => $query->where('status', 'active')]);
            }
            if ($smallGroupMeetingsTableExists) {
                $query->with(['meetings' => fn ($query) => $query
                    ->where('status', 'scheduled')
                    ->where('starts_at', '>=', now())
                    ->orderBy('starts_at')
                    ->limit(3)]);
            }

            $groups = $query->get();
        }

        return Inertia::render('Public/SmallGroups', [
            'laravelVersion' => Application::VERSION,
            'groups' => $groups,
            'authenticated' => $request->user() !== null,
            'joinedGroupIds' => $request->user() && $smallGroupsTableExists && $smallGroupMembershipsTableExists
                ? $request->user()->smallGroupMemberships()->where('status', 'active')->pluck('small_group_id')->values()
                : [],
            'flash' => ['success' => $request->session()->get('success')],
        ]);
    }

    public function joinSmallGroup(Request $request, SmallGroup $smallGroup)
    {
        abort_unless($smallGroup->is_active, 422, 'This small group is not accepting members.');

        SmallGroupMembership::updateOrCreate(
            [
                'small_group_id' => $smallGroup->id,
                'user_id' => $request->user()->id,
            ],
            [
                'status' => 'active',
                'joined_at' => now(),
            ]
        );

        return redirect()->route('small-groups')->with('success', 'You joined the small group successfully.');
    }

    public function smallGroupMessages(Request $request, SmallGroup $smallGroup)
    {
        abort_unless($smallGroup->is_active, 404);
        abort_unless($this->activeSmallGroupMembership($request, $smallGroup), 403);

        return Inertia::render('Member/SmallGroupMessages', [
            'group' => $smallGroup,
            'messages' => $smallGroup->messages()
                ->with('user:id,name')
                ->latest()
                ->limit(50)
                ->get()
                ->reverse()
                ->values(),
        ]);
    }

    public function storeSmallGroupMessage(Request $request, SmallGroup $smallGroup)
    {
        abort_unless($smallGroup->is_active, 404);
        abort_unless($this->activeSmallGroupMembership($request, $smallGroup), 403);

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:2', 'max:5000'],
        ]);

        SmallGroupMessage::create([
            'small_group_id' => $smallGroup->id,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        return redirect()->route('small-groups.messages', $smallGroup)->with('success', 'Message posted to the group.');
    }

    private function activeSmallGroupMembership(Request $request, SmallGroup $smallGroup): bool
    {
        return $smallGroup->memberships()
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->exists();
    }

    public function volunteer()
    {
        return Inertia::render('Public/Volunteer', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function giving()
    {
        return Inertia::render('Public/Giving', [
            'laravelVersion' => Application::VERSION,
            'flash' => [
                'success' => request()->session()->get('success'),
            ],
        ]);
    }

    // Resources & Community Pages
    public function community()
    {
        return Inertia::render('Public/Community', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    private function churchUnitCatalog(): array
    {
        return [
            'church-presbytery' => [
                'slug' => 'church-presbytery',
                'name' => 'Church Presbytery',
                'category' => 'Spiritual Leadership',
                'summary' => 'The spiritual oversight and leadership council that guides doctrine, prayer, pastoral direction, and church accountability.',
                'aim' => 'To provide spiritual direction, pastoral oversight, and wise governance for the growth and health of the church.',
                'objectives' => [
                    'Strengthen sound doctrine and spiritual alignment across the church.',
                    'Provide pastoral review and counsel for church leadership and members.',
                    'Support unity, discipline, accountability, and biblical order.',
                    'Guide major ministry decisions and the church’s spiritual vision.',
                ],
                'duties' => [
                    'Pray for and oversee the spiritual welfare of the congregation.',
                    'Review ministry reports and provide pastoral guidance.',
                    'Coordinate prayer, teaching priorities, and church-wide spiritual focus.',
                    'Ensure the church remains rooted in Scripture, holiness, and accountability.',
                ],
                'leadership' => [
                    ['name' => 'Pastor in Charge', 'role' => 'Chairman'],
                    ['name' => 'Elders Council', 'role' => 'Spiritual Oversight'],
                    ['name' => 'Secretary', 'role' => 'Records & Coordination'],
                ],
                'members' => ['Elders', 'Deacons', 'Church Leaders', 'Assigned Prayer Team'],
                'highlights' => ['Pastoral oversight', 'Doctrinal alignment', 'Spiritual direction', 'Church accountability'],
            ],
            'church-administration-unit' => [
                'slug' => 'church-administration-unit',
                'name' => 'Church Administration Unit',
                'category' => 'Operations & Structure',
                'summary' => 'The administrative backbone of the church, ensuring smooth coordination, documentation, and operational efficiency.',
                'aim' => 'To maintain effective church administration that supports spiritual growth, order, and service delivery.',
                'objectives' => [
                    'Coordinate church operations and internal planning.',
                    'Ensure records, reports, and communication are accurate and timely.',
                    'Support leaders in strategic decision-making and church management.',
                    'Strengthen efficiency across all departments and service activities.',
                ],
                'duties' => [
                    'Maintain church records, directories, and official communication.',
                    'Coordinate schedules, meetings, and administrative follow-ups.',
                    'Support welfare, planning, and reporting across ministries.',
                    'Ensure compliance, documentation, and continuity of church operations.',
                ],
                'leadership' => [
                    ['name' => 'Administrative Head', 'role' => 'Unit Leader'],
                    ['name' => 'Office Secretary', 'role' => 'Records & Communication'],
                    ['name' => 'Finance Liaison', 'role' => 'Support Coordination'],
                ],
                'members' => ['Administrative Officers', 'Secretariat Team', 'Support Staff', 'Department Coordinators'],
                'highlights' => ['Records management', 'Planning', 'Operations support', 'Communication'],
            ],
            'sunday-school-unit' => [
                'slug' => 'sunday-school-unit',
                'name' => 'Sunday School Unit',
                'category' => 'Children & Discipleship',
                'summary' => 'A faith-building unit dedicated to teaching children and young learners the Word of God in a vibrant and engaging way.',
                'aim' => 'To disciple children and youth through biblical teaching, character building, and scriptural understanding.',
                'objectives' => [
                    'Teach biblical truths in a clear and age-appropriate manner.',
                    'Encourage Christian character, prayerfulness, and obedience.',
                    'Promote scripture memorization and personal devotion.',
                    'Nurture a love for God and the church from an early age.',
                ],
                'duties' => [
                    'Prepare lesson materials and lead Bible study sessions.',
                    'Guide children in prayer, worship, and spiritual growth.',
                    'Support children with pastoral care and classroom discipline.',
                    'Coordinate children’s spiritual milestones and follow-up.',
                ],
                'leadership' => [
                    ['name' => 'Sunday School Coordinator', 'role' => 'Unit Leader'],
                    ['name' => 'Teachers Team', 'role' => 'Bible Teaching'],
                    ['name' => 'Class Mentors', 'role' => 'Support & Follow-up'],
                ],
                'members' => ['Teachers', 'Assistant Teachers', 'Children', 'Parents Support Group'],
                'highlights' => ['Bible teaching', 'Character formation', 'Spiritual mentorship', 'Youth discipleship'],
            ],
            'choir-unit' => [
                'slug' => 'choir-unit',
                'name' => 'Choir Unit',
                'category' => 'Worship & Praise',
                'summary' => 'The church’s worship expression team, leading the congregation in heartfelt praise, worship, and spiritual atmosphere.',
                'aim' => 'To lead the church in vibrant and Spirit-filled worship that glorifies God and inspires the congregation.',
                'objectives' => [
                    'Lift worship to God with excellence and reverence.',
                    'Encourage congregational participation in praise and adoration.',
                    'Support spiritual ambiance during services and special programmes.',
                    'Train singers and instrumentalists for ministry excellence.',
                ],
                'duties' => [
                    'Lead songs and choruses during worship services.',
                    'Prepare special renditions for prayer meetings and revival programmes.',
                    'Support choir rehearsals and musical coordination.',
                    'Maintain harmony, unity, and spirit-led worship in the assembly.',
                ],
                'leadership' => [
                    ['name' => 'Choir Director', 'role' => 'Music Leadership'],
                    ['name' => 'Section Leaders', 'role' => 'Voice & Harmony'],
                    ['name' => 'Rehearsal Coordinator', 'role' => 'Practice & Preparation'],
                ],
                'members' => ['Soprano Team', 'Alto Team', 'Tenor Team', 'Bass Team', 'Instrumentalist Team'],
                'highlights' => ['Worship leading', 'Music ministry', 'Service atmosphere', 'Congregational praise'],
            ],
            'media-unit' => [
                'slug' => 'media-unit',
                'name' => 'Media Unit',
                'category' => 'Communication & Visibility',
                'summary' => 'The media and communication team responsible for documenting, broadcasting, and enhancing the church’s public and internal communication.',
                'aim' => 'To promote the church’s mission through impactful media, communication, and digital engagement.',
                'objectives' => [
                    'Capture church events and spiritual moments.',
                    'Support digital outreach and church publicity.',
                    'Maintain quality audio-visual communication during services.',
                    'Highlight testimonies, teachings, and church mission through media.',
                ],
                'duties' => [
                    'Manage sound, video, projection, and livestream systems.',
                    'Document church programmes for records and promotion.',
                    'Support social media, announcements, and public communication.',
                    'Maintain media equipment and technical presentations.',
                ],
                'leadership' => [
                    ['name' => 'Media Coordinator', 'role' => 'Unit Head'],
                    ['name' => 'Video Team', 'role' => 'Recording & Production'],
                    ['name' => 'Sound Team', 'role' => 'Audio & Streaming'],
                ],
                'members' => ['Cameramen', 'Graphic Designers', 'Audio Operators', 'Content Editors'],
                'highlights' => ['Live streaming', 'Digital outreach', 'Event documentation', 'Visual communication'],
            ],
            'evangelism-unit' => [
                'slug' => 'evangelism-unit',
                'name' => 'Evangelism Unit',
                'category' => 'Outreach & Mission',
                'summary' => 'The church’s mission movement focused on soul-winning, outreach, and making Christ known in communities and cities.',
                'aim' => 'To spread the gospel, witness to the lost, and multiply disciples through evangelistic outreach.',
                'objectives' => [
                    'Win souls for Christ through prayers, preaching, and witness.',
                    'Mobilize members for community outreach and evangelism.',
                    'Support converts with follow-up and discipleship.',
                    'Expand the reach of the church through mission and partnerships.',
                ],
                'duties' => [
                    'Conduct evangelistic meetings and open-air outreaches.',
                    'Visit homes, communities, and public spaces with the gospel.',
                    'Distribute invitations, tracts, and gospel messages.',
                    'Follow up new converts and connect them to church life.',
                ],
                'leadership' => [
                    ['name' => 'Evangelism Leader', 'role' => 'Outreach Direction'],
                    ['name' => 'Field Coordinators', 'role' => 'Community Mission'],
                    ['name' => 'Follow-up Team', 'role' => 'Discipleship Support'],
                ],
                'members' => ['Outreach Team', 'Prayer Evangelists', 'Follow-up Team', 'Home Mission Members'],
                'highlights' => ['Soul winning', 'Community outreach', 'Follow-up discipleship', 'Mission impact'],
            ],
            'sanitation-unit' => [
                'slug' => 'sanitation-unit',
                'name' => 'Sanitation Unit',
                'category' => 'Environment & Order',
                'summary' => 'The care and cleanliness team responsible for maintaining a healthy, organized, and welcoming church environment.',
                'aim' => 'To maintain cleanliness, order, and a safe worship environment for all members and guests.',
                'objectives' => [
                    'Promote hygiene and cleanliness within the church environment.',
                    'Keep service spaces orderly and welcoming.',
                    'Ensure safety and comfort for worshippers and visitors.',
                    'Support church events with proper environmental care and preparation.',
                ],
                'duties' => [
                    'Clean worship halls, toilets, and church premises.',
                    'Prepare surroundings for programmes and special meetings.',
                    'Organize waste disposal and environmental upkeep.',
                    'Support housekeeping protocols for all church gatherings.',
                ],
                'leadership' => [
                    ['name' => 'Sanitation Coordinator', 'role' => 'Unit Leader'],
                    ['name' => 'Cleaning Team', 'role' => 'Premises Upkeep'],
                    ['name' => 'Facility Support', 'role' => 'Environment Maintenance'],
                ],
                'members' => ['Cleaning Crew', 'Support Volunteers', 'Event Setup Team', 'Safety Helpers'],
                'highlights' => ['Clean environment', 'Orderliness', 'Safety', 'Service readiness'],
            ],
            'ushering-unit' => [
                'slug' => 'ushering-unit',
                'name' => 'Ushering Unit',
                'category' => 'Hospitality & Order',
                'summary' => 'The hospitality and service team responsible for receiving members and guests with warmth, order, and care.',
                'aim' => 'To create a welcoming, orderly, and spiritually friendly environment for worship and church gatherings.',
                'objectives' => [
                    'Receive members and guests with warm hospitality.',
                    'Help maintain order and smooth service flow.',
                    'Guide attendees to seats and support event setup.',
                    'Ensure a respectful and caring atmosphere in all programmes.',
                ],
                'duties' => [
                    'Welcome members and visitors during services.',
                    'Manage seating arrangements and service flow.',
                    'Support church protocol and organized access.',
                    'Relay pastoral and logistical support during programmes.',
                ],
                'leadership' => [
                    ['name' => 'Head Usher', 'role' => 'Unit Leader'],
                    ['name' => 'Service Team', 'role' => 'Hospitality & Flow'],
                    ['name' => 'Greeters', 'role' => 'Welcome & Guidance'],
                ],
                'members' => ['Usher Team', 'Greeters', 'Seating Coordinators', 'Front Desk Support'],
                'highlights' => ['Hospitality', 'Order', 'Welcoming environment', 'Service flow'],
            ],
            'protocol-unit' => [
                'slug' => 'protocol-unit',
                'name' => 'Protocol Unit',
                'category' => 'Order & Public Conduct',
                'summary' => 'The protocol team responsible for order, decorum, and graceful flow during meetings, special events, and official church programs.',
                'aim' => 'To ensure proper order, respect, and beautiful conduct during church services and public engagements.',
                'objectives' => [
                    'Create a dignified and orderly environment for church programmes.',
                    'Guide dignitaries, guests, and new members respectfully.',
                    'Coordinate entry, seating, and public service order.',
                    'Promote professionalism and reverence in all church gatherings.',
                ],
                'duties' => [
                    'Coordinate seating, arrivals, and event flow.',
                    'Assist with church etiquette and official proceedings.',
                    'Support special ceremonies and public church events.',
                    'Ensure order and respect during services and programmes.',
                ],
                'leadership' => [
                    ['name' => 'Protocol Leader', 'role' => 'Unit Leadership'],
                    ['name' => 'Event Protocol Team', 'role' => 'Manage order and movement'],
                    ['name' => 'Guest Support Team', 'role' => 'Hospitality & Coordination'],
                ],
                'members' => ['Protocol Officers', 'Guests Support Team', 'Ceremony Assistants', 'Service Marshals'],
                'highlights' => ['Orderly services', 'Graceful engagement', 'Guest handling', 'Event coordination'],
            ],
            'technical-team-unit' => [
                'slug' => 'technical-team-unit',
                'name' => 'Technical Team Unit',
                'category' => 'Media & Operations',
                'summary' => 'The technical arm of the church, supporting sound, display, streaming, and digital systems for smooth worship experiences.',
                'aim' => 'To ensure all technical aspects of church services and events run efficiently and excellently.',
                'objectives' => [
                    'Support smooth audio-visual services during worship and meetings.',
                    'Maintain church tech infrastructure and equipment.',
                    'Facilitate live streaming and presentation excellence.',
                    'Provide technical support across church events and programmes.',
                ],
                'duties' => [
                    'Operate sound and visual systems during services.',
                    'Manage live transmissions, projectors, and microphones.',
                    'Troubleshoot technical issues quickly and professionally.',
                    'Maintain technical readiness and backup systems.',
                ],
                'leadership' => [
                    ['name' => 'Technical Lead', 'role' => 'Unit Head'],
                    ['name' => 'AV Engineers', 'role' => 'Audio & Visual Support'],
                    ['name' => 'Streaming Team', 'role' => 'Broadcast Coordination'],
                ],
                'members' => ['Audio Team', 'Visual Team', 'Streaming Operators', 'Maintenance Assistants'],
                'highlights' => ['Sound systems', 'Live streaming', 'Visual production', 'Technical coordination'],
            ],
            'welfare-unit' => [
                'slug' => 'welfare-unit',
                'name' => 'Welfare Unit',
                'category' => 'Care & Support',
                'summary' => 'A caring and compassionate unit that reaches out to members in need with prayer, support, and practical assistance.',
                'aim' => 'To demonstrate Christlike compassion and practical care to members and families in need.',
                'objectives' => [
                    'Identify and support members facing hardship or special need.',
                    'Provide prayerful care and practical assistance.',
                    'Encourage solidarity and belonging within the church family.',
                    'Support families during crises and seasons of transition.',
                ],
                'duties' => [
                    'Visit members in need and provide pastoral follow-up.',
                    'Coordinate food, prayer, and support assistance.',
                    'Track welfare needs and connect people with appropriate help.',
                    'Encourage compassion, care, and community belonging.',
                ],
                'leadership' => [
                    ['name' => 'Welfare Coordinator', 'role' => 'Unit Leader'],
                    ['name' => 'Care Team', 'role' => 'Member Outreach'],
                    ['name' => 'Follow-up Team', 'role' => 'Support & Check-ins'],
                ],
                'members' => ['Care Volunteers', 'Prayer Partners', 'Hospitality Support Team', 'Need Assessment Team'],
                'highlights' => ['Pastoral care', 'Compassion', 'Member support', 'Practical help'],
            ],
            'children-evangelism-unit' => [
                'slug' => 'children-evangelism-unit',
                'name' => 'Children Evangelism Unit',
                'category' => 'Children & Outreach',
                'summary' => 'A focused outreach arm reaching children with the gospel message, love of Christ, and practical discipleship.',
                'aim' => 'To win and disciple children through the love of Christ, prayer, and biblical instruction.',
                'objectives' => [
                    'Share the gospel with children in homes, schools, and communities.',
                    'Build children’s faith and confidence in God.',
                    'Create safe and loving spaces for children to grow spiritually.',
                    'Encourage sustained follow-up and child discipleship.',
                ],
                'duties' => [
                    'Conduct children’s evangelism outreaches.',
                    'Teach Bible truths in engaging ways.',
                    'Support child discipleship and care.',
                    'Work with parents and caregivers to develop Christ-centered children.',
                ],
                'leadership' => [
                    ['name' => 'Children Evangelism Coordinator', 'role' => 'Lead Vision'],
                    ['name' => 'School Outreach Team', 'role' => 'Community Reach'],
                    ['name' => 'Children Mentors', 'role' => 'Guidance & Nurture'],
                ],
                'members' => ['Children Outreach Team', 'School Mission Volunteers', 'Bible Teachers', 'Care Volunteers'],
                'highlights' => ['Child evangelism', 'School outreach', 'Faith foundation', 'Spiritual nurture'],
            ],
            'children-unit-church' => [
                'slug' => 'children-unit-church',
                'name' => 'Children Unit/Church',
                'category' => 'Children & Family',
                'summary' => 'The church’s child discipleship and family-life arm that nurtures children in faith, discipline, and godly living.',
                'aim' => 'To raise children in faith, wisdom, and a loving relationship with God and the church family.',
                'objectives' => [
                    'Build strong spiritual roots in children.',
                    'Support parents in nurturing healthy Christian homes.',
                    'Create age-appropriate learning and fellowship spaces.',
                    'Encourage children to become active disciples of Christ.',
                ],
                'duties' => [
                    'Coordinate child-focused teaching and fellowship programmes.',
                    'Participate in church-wide children’s events and activities.',
                    'Encourage child prayer, participation, and obedience.',
                    'Maintain a healthy, loving environment for every child.',
                ],
                'leadership' => [
                    ['name' => 'Children Unit Leader', 'role' => 'Children Ministry'],
                    ['name' => 'Children Workers', 'role' => 'Support & Mentorship'],
                    ['name' => 'Parent Liaison', 'role' => 'Family Connection'],
                ],
                'members' => ['Children Workers', 'Parents', 'Child Mentors', 'Family Support Team'],
                'highlights' => ['Family nurture', 'Child discipleship', 'Spiritual growth', 'Christ-centered living'],
            ],
            'youth-unit-ministry' => [
                'slug' => 'youth-unit-ministry',
                'name' => 'Youth Unit/Ministry',
                'category' => 'Youth & Leadership',
                'summary' => 'A dynamic ministry for teenagers and young adults that fosters spiritual growth, leadership, creativity, and community.',
                'aim' => 'To raise strong, purpose-driven young believers who are spiritually grounded and active in the church.',
                'objectives' => [
                    'Discipleship young people in Christ and biblical values.',
                    'Develop leadership, creativity, and kingdom influence among youth.',
                    'Create spaces for fellowship, worship, and mentorship.',
                    'Prepare youth for service in the church and society.',
                ],
                'duties' => [
                    'Organize youth worship, teaching, and fellowship programmes.',
                    'Provide mentorship, prayer, and discipleship support.',
                    'Mobilize youth for outreach and service opportunities.',
                    'Promote teamwork, purity, responsibility, and purpose.',
                ],
                'leadership' => [
                    ['name' => 'Youth Pastor/Leader', 'role' => 'Ministry Leadership'],
                    ['name' => 'Youth Coordinators', 'role' => 'Programme Planning'],
                    ['name' => 'Mentors', 'role' => 'Discipleship Support'],
                ],
                'members' => ['Teenagers', 'Young Adults', 'Leaders', 'Prayer & Worship Team'],
                'highlights' => ['Youth discipleship', 'Leadership formation', 'Worship', 'Outreach'],
            ],
            'mens-movement' => [
                'slug' => 'mens-movement',
                'name' => 'Men’s Movement',
                'category' => 'Men’s Fellowship',
                'summary' => 'A fellowship movement focused on men’s spiritual growth, responsibility, integrity, and kingdom leadership at home and in church.',
                'aim' => 'To raise men who are spiritually strong, godly, responsible, and committed to Christian leadership.',
                'objectives' => [
                    'Develop male discipleship and spiritual maturity.',
                    'Encourage men to lead with integrity at home and in church.',
                    'Promote prayer, accountability, and godly character.',
                    'Strengthen the role of men in service and family leadership.',
                ],
                'duties' => [
                    'Hold men’s prayer meetings and teaching sessions.',
                    'Encourage accountability and mentoring among men.',
                    'Support spiritual leadership and family responsibility.',
                    'Lead outreach and support activities within the church.',
                ],
                'leadership' => [
                    ['name' => 'Men’s Leader', 'role' => 'Movement Coordinator'],
                    ['name' => 'Prayer Team', 'role' => 'Spiritual Support'],
                    ['name' => 'Mentors', 'role' => 'Leadership Development'],
                ],
                'members' => ['Men of the Church', 'Prayer Partners', 'Fellowship Group', 'Support Mentors'],
                'highlights' => ['Godly leadership', 'Prayer', 'Accountability', 'Family responsibility'],
            ],
            'good-womens-movement' => [
                'slug' => 'good-womens-movement',
                'name' => 'Good Women’s Movement',
                'category' => 'Women’s Fellowship',
                'summary' => 'A supportive and spiritual women’s fellowship focused on prayer, encouragement, discipleship, and godly living.',
                'aim' => 'To empower women to grow spiritually strong, support one another, and live purposeful Christian lives.',
                'objectives' => [
                    'Strengthen women in prayer and the Word of God.',
                    'Encourage fellowship, care, and support among women.',
                    'Develop godly character, leadership, and service.',
                    'Promote women’s involvement in church and community impact.',
                ],
                'duties' => [
                    'Conduct women’s prayer and Bible study meetings.',
                    'Offer care support to women and their families.',
                    'Coordinate empowerment and mentoring programmes.',
                    'Promote unity, grace, and service among women of the church.',
                ],
                'leadership' => [
                    ['name' => 'Women’s Leader', 'role' => 'Movement Coordinator'],
                    ['name' => 'Prayer Coordinators', 'role' => 'Prayers & Intercession'],
                    ['name' => 'Care Team', 'role' => 'Support & Encouragement'],
                ],
                'members' => ['Women of the Church', 'Prayers Team', 'Care Group', 'Fellowship Members'],
                'highlights' => ['Prayer', 'Women’s support', 'Discipleship', 'Spiritual empowerment'],
            ],
        ];
    }

    public function units()
    {
        return Inertia::render('Public/Units', [
            'laravelVersion' => Application::VERSION,
            'units' => array_values($this->churchUnitCatalog()),
        ]);
    }

    public function unitDetail(string $unit)
    {
        $catalog = $this->churchUnitCatalog();
        $selected = $catalog[$unit] ?? null;

        if (!$selected) {
            abort(404, 'Unit not found.');
        }

        return Inertia::render('Public/UnitDetail', [
            'laravelVersion' => Application::VERSION,
            'unit' => $selected,
            'allUnits' => array_values($catalog),
        ]);
    }

    public function ministries()
    {
        if (!Schema::hasTable('church_ministries')) {
            return Inertia::render('Public/Ministries', [
                'laravelVersion' => Application::VERSION,
                'ministries' => [],
            ]);
        }

        $ministries = ChurchMinistry::query()
            ->with(['leadershipProfiles' => function ($query) {
                $query->where('is_active', true)->orderBy('name');
            }])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Public/Ministries', [
            'laravelVersion' => Application::VERSION,
            'ministries' => $ministries,
        ]);
    }

    public function ministryDetail(ChurchMinistry $ministry)
    {
        if (!Schema::hasTable('church_ministries')) {
            return Inertia::render('Public/MinistryDetail', [
                'laravelVersion' => Application::VERSION,
                'ministry' => $ministry,
            ]);
        }

        $ministry->load(['leadershipProfiles' => function ($query) {
            $query->where('is_active', true)->orderBy('name');
        }]);

        return Inertia::render('Public/MinistryDetail', [
            'laravelVersion' => Application::VERSION,
            'ministry' => $ministry,
        ]);
    }

    public function media()
    {
        if (!Schema::hasTable('church_media_content')) {
            return Inertia::render('Public/Media', [
                'laravelVersion' => Application::VERSION,
                'media' => [],
                'featuredMedia' => [],
            ]);
        }

        $media = ChurchMediaContent::query()
            ->where('status', 'published')
            ->orderByDesc('featured')
            ->orderByDesc('published_at')
            ->get();

        $featuredMedia = $media->where('featured', true)->values();

        if ($featuredMedia->count() < 3) {
            $usedIds = $featuredMedia->pluck('id');
            $fallbackMedia = $media
                ->reject(fn ($item) => $usedIds->contains($item->id))
                ->take(3 - $featuredMedia->count());

            $featuredMedia = $featuredMedia->merge($fallbackMedia)->values();
        }

        if ($featuredMedia->isEmpty()) {
            $featuredMedia = $media->take(3)->values();
        }

        return Inertia::render('Public/Media', [
            'laravelVersion' => Application::VERSION,
            'media' => $media,
            'featuredMedia' => $featuredMedia,
        ]);
    }

    public function mediaDetail(ChurchMediaContent $media)
    {
        abort_unless($media->status === 'published', 404);

        if (!Schema::hasTable('church_media_content')) {
            return Inertia::render('Public/MediaDetail', [
                'laravelVersion' => Application::VERSION,
                'media' => $media,
                'relatedMedia' => [],
            ]);
        }

        $relatedMedia = ChurchMediaContent::query()
            ->where('id', '!=', $media->id)
            ->where('status', 'published')
            ->when($media->content_type, fn ($query) => $query->where('content_type', $media->content_type))
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        if ($relatedMedia->isEmpty()) {
            $relatedMedia = ChurchMediaContent::query()
                ->where('id', '!=', $media->id)
                ->where('status', 'published')
                ->orderByDesc('published_at')
                ->limit(3)
                ->get();
        }

        return Inertia::render('Public/MediaDetail', [
            'laravelVersion' => Application::VERSION,
            'media' => $media,
            'relatedMedia' => $relatedMedia,
        ]);
    }

    public function events()
    {
        $events = Event::upcoming()
            ->withCount(['registrations as active_registration_count' => fn ($query) => $query->whereIn('status', ['registered', 'confirmed', 'attended'])])
            ->orderBy('start_date')
            ->get()
            ->map(function ($event) {
                $event->can_register = $event->status === 'registration_open'
                    && Carbon::parse($event->start_date)->isFuture()
                    && (!$event->registration_deadline || Carbon::parse($event->registration_deadline)->isFuture())
                    && ($event->max_participants === null || $event->active_registration_count < $event->max_participants);
                return $event;
            });

        return Inertia::render('Public/Events', [
            'laravelVersion' => Application::VERSION,
            'events' => $events,
        ]);
    }

    public function announcements()
    {
        $announcements = ChurchAnnouncement::query()
            ->where('status', 'published')
            ->where(function ($query) {
                $query->whereNull('published_at')->orWhereDate('published_at', '<=', now());
            })
            ->orderByDesc('published_at')
            ->get();

        return Inertia::render('Public/Announcements', [
            'announcements' => $announcements,
        ]);
    }

    public function eventDetail(Event $event)
    {
        abort_unless(Event::upcoming()->whereKey($event->id)->exists(), 404);
        $event->loadCount(['registrations as active_registration_count' => fn ($query) => $query->whereIn('status', ['registered', 'confirmed', 'attended'])]);
        $event->can_register = $event->status === 'registration_open'
            && Carbon::parse($event->start_date)->isFuture()
            && (!$event->registration_deadline || Carbon::parse($event->registration_deadline)->isFuture())
            && ($event->max_participants === null || $event->active_registration_count < $event->max_participants);

        $relatedEvents = Event::query()
            ->where('id', '!=', $event->id)
            ->upcoming()
            ->orderBy('start_date')
            ->limit(3)
            ->get();

        return Inertia::render('Public/EventDetail', [
            'laravelVersion' => Application::VERSION,
            'event' => $event,
            'relatedEvents' => $relatedEvents,
            'isRegistered' => Auth::check() && $event->registrations()->where('user_id', Auth::id())->exists(),
        ]);
    }

    public function eventCalendar(Event $event)
    {
        abort_unless($event->status !== 'cancelled', 404);

        $escape = static fn (string $value): string => str_replace(["\\", ";", ",", "\r", "\n"], ["\\\\", "\\;", "\\,", '', '\\n'], $value);
        $formatDate = static fn ($date): string => $date->utc()->format('Ymd\\THis\\Z');
        $description = $escape((string) $event->description);
        $location = $escape((string) ($event->location ?: ($event->is_virtual ? 'Online gathering' : 'Church campus')));
        $ics = implode("\r\n", [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//APGA Worldwide//Church Events//EN',
            'BEGIN:VEVENT',
            'UID:church-event-' . $event->id . '@apga-worldwide',
            'DTSTAMP:' . now()->utc()->format('Ymd\THis\Z'),
            'DTSTART:' . $formatDate($event->start_date),
            'DTEND:' . $formatDate($event->end_date),
            'SUMMARY:' . $escape((string) $event->title),
            'DESCRIPTION:' . $description,
            'LOCATION:' . $location,
            'END:VEVENT',
            'END:VCALENDAR',
            '',
        ]);

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="event-' . $event->id . '.ics"',
        ]);
    }

    public function registerEvent(Event $event, Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $registrationResult = DB::transaction(function () use ($event) {
            $lockedEvent = Event::query()->lockForUpdate()->findOrFail($event->id);

            if ($lockedEvent->status !== 'registration_open' || $lockedEvent->start_date?->isPast()) {
                return 'closed';
            }

            if ($lockedEvent->registrations()->where('user_id', Auth::id())->exists()) {
                return 'duplicate';
            }

            if ($lockedEvent->registration_deadline?->isPast()) {
                return 'deadline';
            }

            $activeRegistrations = $lockedEvent->registrations()
                ->whereIn('status', ['registered', 'confirmed', 'attended'])
                ->count();

            if ($lockedEvent->max_participants !== null && $activeRegistrations >= $lockedEvent->max_participants) {
                return 'capacity';
            }

            EventRegistration::create([
                'user_id' => Auth::id(),
                'event_id' => $lockedEvent->id,
                'status' => 'registered',
                'registered_at' => now(),
            ]);

            return 'registered';
        });

        if ($registrationResult === 'duplicate') {
            return redirect()->route('events.detail', $event)->with('info', 'You are already registered for this event.');
        }

        if ($registrationResult === 'deadline') {
            return redirect()->route('events.detail', $event)->with('info', 'Registration for this event has closed.');
        }

        if ($registrationResult === 'capacity') {
            return redirect()->route('events.detail', $event)->with('info', 'This event has reached its registration capacity.');
        }

        if ($registrationResult === 'closed') {
            return redirect()->route('events')->with('info', 'Registration is not open for this event.');
        }

        return redirect()->route('events.detail', $event)->with('success', 'You have successfully registered for ' . $event->title . '.');
    }

    public function storePrayerRequest(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'request_type' => ['required', 'in:healing,thanksgiving,guidance,deliverance,other'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
            'is_public' => ['nullable', 'boolean'],
        ]);

        ChurchPrayerRequest::create([
            'user_id' => $request->user()?->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'] ?? $request->user()?->email,
            'request_type' => $validated['request_type'],
            'message' => $validated['message'],
            'is_public' => (bool) ($validated['is_public'] ?? false),
            'status' => 'pending',
        ]);

        return redirect()->route('prayer-requests')->with('success', 'Your prayer request has been received and will be lifted in prayer.');
    }

    public function knowledgeBase()
    {
        return Inertia::render('Public/KnowledgeBase', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function resources()
    {
        return Inertia::render('Public/Resources', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function prayerRequests(Request $request)
    {
        return Inertia::render('Public/PrayerRequests', [
            'laravelVersion' => Application::VERSION,
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }

    public function support()
    {
        return Inertia::render('Public/Support', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function contact()
    {
        return Inertia::render('Public/Contact', [
            'laravelVersion' => Application::VERSION,
            'contact' => config('church.contact'),
        ]);
    }

    public function locationHours()
    {
        return Inertia::render('Public/LocationHours', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function sendMessage()
    {
        return Inertia::render('Public/SendMessage', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function storeMessage(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ]);

        ChurchContactMessage::create([
            ...$validated,
            'user_id' => $request->user()?->id,
            'status' => 'open',
        ]);

        return redirect()->route('send-message')->with('success', 'Your message has been received by the church team.');
    }

    public function faq()
    {
        return Inertia::render('Public/FAQ', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function feedback()
    {
        return Inertia::render('Public/Feedback', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    // Legal & Compliance Pages
    public function privacy()
    {
        return Inertia::render('Public/Legal/Privacy', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function terms()
    {
        return Inertia::render('Public/Legal/Terms', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function cookies()
    {
        return Inertia::render('Public/Legal/Cookies', [
            'laravelVersion' => Application::VERSION,
        ]);
    }

    public function disclaimer()
    {
        return Inertia::render('Public/Legal/Disclaimer', [
            'laravelVersion' => Application::VERSION,
        ]);
    }
}
