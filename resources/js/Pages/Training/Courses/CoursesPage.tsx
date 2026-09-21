import React, { useEffect, useState } from 'react';
import { usePage, Head, router } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Search, Star, Clock, BookOpen, Heart, Play } from 'lucide-react';
import ModernLayout from '@/Layouts/Training/TrainingLayout';

interface Course {
  id: number;
  title: string;
  short_description?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | string;
  duration_hours?: number;
  rating?: number | string;
  slug?: string;
}

interface Enrollment {
  id: number;
  course: Course;
  progress_percentage?: number;
  status?: string;
}

interface PageProps extends InertiaPageProps {
  courses?: { data: Course[] };
  featured_courses?: Course[];
  enrolled_courses?: Enrollment[] | { data: Enrollment[] } | null;
  initial_mode?: 'browse' | 'my';
}

export default function CoursesPage(): JSX.Element {
  const { courses, featured_courses, enrolled_courses, initial_mode } = usePage<PageProps>().props;

  // Safely normalize enrolled_courses from various possible formats
  const normalizeEnrolledCourses = (data: any): Enrollment[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const [mode, setMode] = useState<'browse' | 'my' | 'completed' | 'favourites'>(initial_mode === 'my' ? 'my' : 'browse');
  const [enrolledList, setEnrolledList] = useState<Enrollment[]>(normalizeEnrolledCourses(enrolled_courses));
  const [completedList, setCompletedList] = useState<Enrollment[]>([]);
  const [favourites, setFavourites] = useState<{ [courseId: number]: boolean }>({});
  const [coursesData, setCoursesData] = useState<Course[]>(Array.isArray(courses?.data) ? courses.data : []);

  const handleToggleFavourite = async (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(`/training/courses/${courseId}/favourite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setFavourites(prev => ({
          ...prev,
          [courseId]: data.is_favourited
        }));
      } else {
        console.error('Toggle favourite failed:', res.status);
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchEnrolled = async () => {
      try {
        const url = (route as any)('training.my-courses.data');
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setEnrolledList(normalizeEnrolledCourses(json.data) || []);
      } catch (e) {
        if (mounted) setEnrolledList([]);
      }
    };

    // Fetch enrolled courses when viewing My Courses or Completed Courses
    if ((mode === 'my' || mode === 'completed') && enrolledList.length === 0) fetchEnrolled();

    // If viewing completed, fetch certificates via dedicated JSON endpoint
    const fetchCompleted = async () => {
      try {
        const url = (route as any)('training.certificates.api.list').toString();
        console.log('[CoursesPage] Fetching completed courses from:', url);
        const res = await fetch(url);

        if (!res.ok) {
          console.error('[CoursesPage] Fetch failed:', res.status);
          return;
        }

        const json = await res.json();
        const certs = json.certificates || [];
        console.log('[CoursesPage] Fetched certificates:', certs);

        const mapped: Enrollment[] = (certs || []).map((it: any, idx: number) => ({
          id: it.id || idx,
          course: it.course || {
            id: it.course_id || 0,
            title: it.course_name || it.title || 'Completed Course',
            short_description: it.course_description || it.short_description || null,
            thumbnail: it.course_thumbnail || it.thumbnail || null,
          },
          progress_percentage: 100,
          status: 'completed',
          certificate_id: it.id,
          certificate: it,
          completed_at: it.completed_at
        } as any));

        console.log('[CoursesPage] Mapped completed list:', mapped);
        if (mounted) setCompletedList(mapped || []);
      } catch (e) {
        console.error('[CoursesPage] Exception fetching certificates:', e);
      }
    };

    if (mode === 'completed') fetchCompleted();
    return () => { mounted = false; };
  }, [mode]);

  useEffect(() => {
    let mounted = true;
    const fetchFavourites = async () => {
      try {
        const res = await fetch('/training/courses/api/favourites');
        if (!res.ok) return;

        const data = await res.json();
        if (mounted && data.success && Array.isArray(data.favourites)) {
          const favMap: { [courseId: number]: boolean } = {};
          data.favourites.forEach((courseId: number) => {
            favMap[courseId] = true;
          });
          setFavourites(favMap);
        }
      } catch (error) {
        console.error('Error fetching favourites:', error);
      }
    };

    fetchFavourites();
    return () => { mounted = false; };
  }, []);

  const getDifficultyColor = (level?: string) => {
    if (level === 'beginner') return 'bg-gradient-to-r from-blue-100 to-red-100 text-red-800 dark:from-blue-800 dark:to-red-900 dark:text-red-100';
    if (level === 'intermediate') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (level === 'advanced') return 'bg-gradient-to-r from-blue-100 to-red-100 text-red-800 dark:from-blue-800 dark:to-red-900 dark:text-red-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleCourseClick = (id: number) => router.visit((route as any)('training.course.detail', id));

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div
      onClick={() => handleCourseClick(course.id)}
      className="flex h-full cursor-pointer flex-row overflow-hidden rounded-lg border border-red-100 bg-gradient-to-br from-white via-white to-rose-50 transition-shadow duration-150 hover:shadow-md dark:border-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-red-950"
    >
      {/* Image - Left side, fixed compact width */}
      <div className="w-28 h-24 flex-shrink-0 rounded-l-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
        {course.thumbnail ? (
          <img src={'/storage/' + course.thumbnail} alt={course.title} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Content - Right side, flexible */}
      <div className="flex-1 flex flex-col justify-between p-3 gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">{course.title}</h3>
          <button onClick={(e) => handleToggleFavourite(e, course.id)} className={`flex-shrink-0 mt-0.5 transition-colors ${favourites[course.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
            <Heart className={`w-4 h-4 ${favourites[course.id] ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{course.short_description || course.description}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getDifficultyColor(course.difficulty_level)}`}>{course.difficulty_level || 'Level'}</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{Number(course.rating ?? 0).toFixed(1)}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_hours ?? 0}h</span>
        </div>
      </div>
    </div>
  );

  const EnrolledCourseCard: React.FC<{ enrollment: Enrollment }> = ({ enrollment }) => {
    const progress = enrollment.progress_percentage ?? 0;
    const handleContinue = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.visit((route as any)('training.course.player', enrollment.course.slug));
    };

    return (
      <div
        onClick={() => handleCourseClick(enrollment.course.id)}
        className="flex h-full cursor-pointer flex-row overflow-hidden rounded-lg border border-red-100 bg-gradient-to-br from-white via-white to-rose-50 transition-shadow duration-150 hover:shadow-md dark:border-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-red-950"
      >
        {/* Image - Left side, fixed compact width */}
        <div className="w-28 h-24 flex-shrink-0 rounded-l-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          {enrollment.course.thumbnail ? (
            <img src={'/storage/' + enrollment.course.thumbnail} alt={enrollment.course.title} className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-xs text-gray-500">No Image</span>
            </div>
          )}
        </div>

        {/* Content - Right side, flexible */}
        <div className="flex-1 flex flex-col justify-between p-3 gap-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">{enrollment.course.title}</h3>
            <button onClick={(e) => handleToggleFavourite(e, enrollment.course.id)} className={`flex-shrink-0 mt-0.5 transition-colors ${favourites[enrollment.course.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
              <Heart className={`w-4 h-4 ${favourites[enrollment.course.id] ? 'fill-current' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{enrollment.course.short_description || enrollment.course.description}</p>

          {/* Progress Bar Section */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-red-500 to-red-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Continue Button & Duration */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleContinue}
              className="flex flex-1 items-center justify-center gap-1.5 rounded bg-gradient-to-r from-blue-600 via-red-500 to-red-600 px-2 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:from-blue-700 hover:to-red-700"
            >
              <Play className="w-3 h-3" />
              Continue
            </button>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 px-2 py-1.5 bg-gray-100 dark:bg-gray-700 rounded whitespace-nowrap">
              <Clock className="w-3 h-3" />{enrollment.course.duration_hours ?? 0}h
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getDifficultyColor(enrollment.course.difficulty_level)}`}>{enrollment.course.difficulty_level || 'Level'}</span>
          </div>
        </div>
      </div>
    );
  };

  const CompletedCourseCard: React.FC<{ enrollment: Enrollment }> = ({ enrollment }) => {
    const handleRevisit = (e: React.MouseEvent) => {
      e.stopPropagation();
      router.visit((route as any)('training.course.player', enrollment.course.slug));
    };

    const handleDownloadCertificate = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Navigate to certificate detail page where user can download/print
      router.visit((route as any)('training.certificates.show', enrollment.id));
    };

    return (
      <div
        // IMPORTANT: Do NOT add onClick here - keep it local to button clicks only
        className="flex h-full flex-row overflow-hidden rounded-lg border border-red-100 bg-gradient-to-br from-white via-white to-rose-50 transition-shadow duration-150 hover:shadow-md dark:border-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-red-950"
      >
        <div className="w-28 h-24 flex-shrink-0 rounded-l-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          {enrollment.course.thumbnail ? (
            <img src={'/storage/' + enrollment.course.thumbnail} alt={enrollment.course.title} className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-xs text-gray-500">No Image</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between p-3 gap-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">{enrollment.course.title}</h3>
            <button onClick={(e) => handleToggleFavourite(e, enrollment.course.id)} className={`flex-shrink-0 mt-0.5 transition-colors ${favourites[enrollment.course.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
              <Heart className={`w-4 h-4 ${favourites[enrollment.course.id] ? 'fill-current' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{enrollment.course.short_description || enrollment.course.description}</p>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleDownloadCertificate}
              className="flex flex-1 items-center justify-center gap-1.5 rounded bg-gradient-to-r from-blue-600 via-red-500 to-red-600 px-2 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:from-blue-700 hover:to-red-700"
            >
              <Star className="w-3 h-3" />
              Download Certificate
            </button>
            <button
              onClick={handleRevisit}
              className="flex flex-1 items-center justify-center gap-1.5 rounded bg-gradient-to-r from-blue-600 via-red-500 to-red-600 px-2 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:from-blue-700 hover:to-red-700"
            >
              <Play className="w-3 h-3" />
              Revisit
            </button>
          </div>
        </div>
      </div>
    );
  };

  const featuredCoursesData = Array.isArray(featured_courses) ? featured_courses : [];

  return (
    <ModernLayout>
      <Head title="Courses" />
      <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-red-50 dark:from-blue-950 dark:via-slate-950 dark:to-red-950">
        <div className="border-b border-red-100 bg-gradient-to-r from-white via-rose-50 to-red-50 dark:border-blue-800 dark:from-blue-950 dark:via-slate-950 dark:to-red-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Explore Our Courses</h1>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search courses..." className="w-full rounded-lg border border-red-200 bg-gradient-to-r from-white via-rose-50 to-red-50 py-3 pl-12 pr-4 text-gray-900 dark:border-blue-700 dark:from-blue-900 dark:via-slate-900 dark:to-red-950 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-red-100 bg-gradient-to-r from-white via-rose-50 to-red-50 p-1 dark:border-blue-700 dark:from-blue-900 dark:via-slate-900 dark:to-red-950">
              <button onClick={() => setMode('browse')} className={`rounded-lg px-3 py-1 text-sm font-medium ${mode === 'browse' ? 'bg-gradient-to-r from-blue-600 via-red-500 to-red-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Browse</button>
              <button onClick={() => setMode('my')} className={`rounded-lg px-3 py-1 text-sm font-medium ${mode === 'my' ? 'bg-gradient-to-r from-blue-600 via-red-500 to-red-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>My Courses</button>
              <button onClick={() => setMode('favourites')} className={`rounded-lg px-3 py-1 text-sm font-medium ${mode === 'favourites' ? 'bg-gradient-to-r from-blue-600 via-red-500 to-red-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Favourites</button>
              <button onClick={() => setMode('completed')} className={`rounded-lg px-3 py-1 text-sm font-medium ${mode === 'completed' ? 'bg-gradient-to-r from-blue-600 via-red-500 to-red-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Completed Courses</button>
            </div>
          </div>

          {mode === 'browse' ? (
            <>
              {featuredCoursesData.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Featured</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {featuredCoursesData.map(c => <CourseCard key={c.id} course={c} />)}
                  </div>
                </div>
              )}

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">All Courses</h2>
              {coursesData.length === 0 ? (
                <div className="rounded-xl border border-red-100 bg-gradient-to-br from-white via-white to-rose-50 py-12 text-center dark:border-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-red-950">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {coursesData.map(course => <CourseCard key={course.id} course={course} />)}
                </div>
              )}
            </>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Courses</h2>
              {!Array.isArray(enrolledList) || enrolledList.length === 0 ? (
                <div className="rounded-xl border border-red-100 bg-gradient-to-br from-white via-white to-rose-50 py-12 text-center dark:border-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-red-950">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses enrolled yet</h3>
                </div>
              ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {enrolledList.map((enrollmentItem) => <EnrolledCourseCard key={enrollmentItem.id} enrollment={enrollmentItem} />)}
                    </div>
                  )}
            </div>
              )}

              {mode === 'favourites' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Favourites</h2>
                  {coursesData.filter(course => favourites[course.id]).length === 0 ? (
                    <div className="rounded-xl border border-red-100 bg-gradient-to-br from-white via-white to-rose-50 py-12 text-center dark:border-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-red-950">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No favourite courses yet</h3>
                      <p className="text-gray-600 dark:text-gray-400">Mark courses as favourite to see them here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {coursesData.filter(course => favourites[course.id]).map(course => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mode === 'completed' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Completed Courses</h2>
                  {completedList.length === 0 ? (
                    <div className="rounded-xl border border-red-100 bg-gradient-to-br from-white via-white to-rose-50 py-12 text-center dark:border-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-red-950">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No completed courses yet</h3>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {completedList.map((enrollmentItem) => (
                        <CompletedCourseCard key={enrollmentItem.id} enrollment={enrollmentItem} />
                      ))}
                    </div>
                  )}
                </div>
              )}
        </div>
      </div>
    </ModernLayout>
  );
}
