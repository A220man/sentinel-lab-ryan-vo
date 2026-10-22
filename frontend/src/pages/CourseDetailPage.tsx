import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Loading, ErrorState, EmptyState } from '../components/StateComponents.tsx';
import type { Course, Module, Lesson } from '../types';
import './CourseDetailPage.css';

const lessonTypeLabels: Record<Lesson['lesson_type'], string> = {
  notebook: 'Notebook',
  video: 'Video',
  article: 'Article',
  exercise: 'Exercise',
};

function formatDuration(minutes: number | null) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getLessonIcon(type: Lesson['lesson_type']) {
  switch (type) {
    case 'notebook':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    case 'video':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      );
    case 'article':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    case 'exercise':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      );
    default:
      return null;
  }
}
export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [courseData, modulesData] = await Promise.all([
          api.getCourse(courseId),
          api.getModules(courseId),
        ]);
        setCourse(courseData);
        setModules(modulesData);

        if (modulesData.length > 0) {
          setExpandedModules(new Set([modulesData[0].id]));
        }
      } catch (err) {
        setError('Failed to load course. Please try again.');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };


  if (loading) {
    return <Loading size="lg" message="Loading course..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!course) {
    return <EmptyState title="Course not found" message="The course you're looking for doesn't exist." />;
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons_count, 0);

  return (
    <div className="course-detail-page">
      <div className="course-hero">
        {course.thumbnail_url && (
          <img src={course.thumbnail_url} alt="" className="course-hero-image" />
        )}
        <div className="course-hero-content">
          <div className="course-hero-badges">
            <span className="course-level-badge">{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
            {course.tags && course.tags.length > 0 && (
              <span className="course-tag-badge">{course.tags[0]}</span>
            )}
          </div>
          <h1 className="course-title">{course.title}</h1>
          {course.description && <p className="course-description">{course.description}</p>}
          <div className="course-meta">
            {course.author && (
              <span className="course-meta-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {course.author}
              </span>
            )}
            <span className="course-meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              {modules.length} module{modules.length !== 1 ? 's' : ''}
            </span>
            <span className="course-meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="course-content">
        <aside className="course-sidebar" aria-label="Course modules">
          <nav className="modules-nav">
            <h2 className="modules-nav-title">Course Content</h2>
            {modules.length === 0 ? (
              <EmptyState
                title="No modules yet"
                message="This course doesn't have any modules yet."
              />
            ) : (
              <ul className="modules-list" role="list">
                {modules.map((module) => (
                  <li key={module.id} className="module-item">
                    <button
                      type="button"
                      className={`module-toggle ${expandedModules.has(module.id) ? 'expanded' : ''}`}
                      onClick={() => toggleModule(module.id)}
                      aria-expanded={expandedModules.has(module.id)}
                      aria-controls={`module-lessons-${module.id}`}
                    >
                      <span className="module-title">{module.title}</span>
                      <span className="module-lesson-count">{module.lessons_count} lessons</span>
                      <svg className="module-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    <div
                      id={`module-lessons-${module.id}`}
                      className={`module-lessons ${expandedModules.has(module.id) ? 'open' : ''}`}
                      role="region"
                      aria-label={`${module.title} lessons`}
                    >
                      {module.lessons_count > 0 && (
                        <LessonList moduleId={module.id} />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </aside>

        <main className="course-main" role="main">
          <section className="course-welcome" aria-labelledby="welcome-heading">
            <h2 id="welcome-heading" className="sr-only">Welcome</h2>
            <div className="welcome-content">
              <h3>Welcome to {course.title}</h3>
              {course.description && <p>{course.description}</p>}
              <p>Start learning by selecting a module from the sidebar.</p>
              {course.tags && course.tags.length > 0 && (
                <div className="course-tags">
                  {course.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function LessonList({ moduleId }: { moduleId: number }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getLessons(moduleId);
        setLessons(data);
      } catch (err) {
        setError('Failed to load lessons.');
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [moduleId]);

  if (loading) {
    return <Loading size="sm" message="Loading lessons..." />;
  }

  if (error) {
    return <div className="lessons-error">{error}</div>;
  }

  if (lessons.length === 0) {
    return <p className="no-lessons">No lessons in this module yet.</p>;
  }

  return (
    <ul className="lessons-list" role="list">
      {lessons.map((lesson) => (
        <li key={lesson.id} className="lesson-item">
          <a
            href={lesson.content_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="lesson-link"
            aria-label={`${lessonTypeLabels[lesson.lesson_type]}: ${lesson.title}${lesson.duration_minutes ? ` (${formatDuration(lesson.duration_minutes)})` : ''}`}
          >
            <span className="lesson-icon" aria-hidden="true">{getLessonIcon(lesson.lesson_type)}</span>
            <div className="lesson-info">
              <span className="lesson-title">{lesson.title}</span>
              <span className="lesson-meta">
                <span className="lesson-type">{lessonTypeLabels[lesson.lesson_type]}</span>
                {lesson.duration_minutes && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{formatDuration(lesson.duration_minutes)}</span>
                  </>
                )}
              </span>
            </div>
            {lesson.content_url && (
              <svg className="lesson-external" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
