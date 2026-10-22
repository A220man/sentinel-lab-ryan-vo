import { Link } from 'react-router-dom';
import type { Course } from '../types';
import './CourseCard.css';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const levelLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const levelColors: Record<string, string> = {
    beginner: 'var(--color-success)',
    intermediate: 'var(--color-warning)',
    advanced: 'var(--color-danger)',
  };

  const tags = course.tags ? course.tags.slice(0, 3) : [];

  return (
    <article className="course-card">
      {course.thumbnail_url && (
        <div className="course-card-image">
          <img src={course.thumbnail_url} alt="" loading="lazy" />
        </div>
      )}
      <div className="course-card-content">
        <div className="course-card-header">
          <h3 className="course-card-title">
            <Link to={`/courses/${course.id}`}>{course.title}</Link>
          </h3>
          <span
            className="course-card-level"
            style={{ backgroundColor: levelColors[course.level] || 'var(--color-secondary)' }}
          >
            {levelLabels[course.level] || course.level}
          </span>
        </div>
        {course.description && (
          <p className="course-card-description">{course.description}</p>
        )}
        <div className="course-card-meta">
          {course.author && (
            <span className="course-card-author">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {course.author}
            </span>
          )}
          <span className="course-card-modules">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            {course.modules_count} module{course.modules_count !== 1 ? 's' : ''}
          </span>
        </div>
        {tags.length > 0 && (
          <div className="course-card-tags" aria-label="Tags">
            {tags.map((tag) => (
              <span key={tag} className="course-card-tag">{tag}</span>
            ))}
            {course.tags && course.tags.length > 3 && (
              <span className="course-card-tag-more">+{course.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}