import { useState, useEffect, useCallback, type FormEvent, Fragment } from 'react';
import { api } from '../api/client';
import CourseCard from '../components/CourseCard.tsx';
import { Loading, ErrorState, EmptyState, PageHeader } from '../components/StateComponents.tsx';
import type { Course, PaginatedResponse } from '../types';
import './CoursesPage.css';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
    total: 0,
    total_pages: 1,
  });
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    published_only: true,
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<Course> = await api.getCourses({
        page: pagination.page,
        page_size: pagination.page_size,
        level: filters.level || undefined,
        published_only: filters.published_only,
        search: filters.search || undefined,
      });
      setCourses(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        total_pages: response.total_pages,
      }));
    } catch (err) {
      setError('Failed to load courses. Please try again.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.page_size, filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleLevelChange = (level: string) => {
    setFilters((prev) => ({ ...prev, level: prev.level === level ? '' : level }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const levels = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  if (loading) {
    return <Loading size="lg" message="Loading courses..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchCourses} />;
  }

  return (
    <div className="courses-page">
      <PageHeader
        title="Courses"
        description="Explore our curated LLM courses with hands-on Colab notebooks"
      />

      <div className="courses-toolbar">
        <form onSubmit={handleSearch} className="search-form" role="search">
          <label htmlFor="search" className="sr-only">Search courses</label>
          <div className="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="search"
              type="search"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="search-input"
            />
          </div>
        </form>

        <div className="filter-group" role="group" aria-label="Filter by level">
          {levels.map((level) => (
            <button
              key={level.value}
              type="button"
              className={`filter-btn ${filters.level === level.value ? 'active' : ''}`}
              onClick={() => handleLevelChange(level.value)}
              aria-pressed={filters.level === level.value}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          message={filters.search || filters.level
            ? 'Try adjusting your search or filters'
            : 'No courses have been published yet. Check back soon!'}
        />
      ) : (
        <>
          <div className="courses-grid" role="list" aria-label="Courses">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {pagination.total_pages > 1 && (
            <nav className="pagination" aria-label="Course pages">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                aria-label="Previous page"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className="pagination-pages" role="group" aria-label="Page numbers">
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (pagination.total_pages <= 7) return true;
                    if (page <= 2) return true;
                    if (page > pagination.total_pages - 2) return true;
                    if (page >= pagination.page - 1 && page <= pagination.page + 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => (
                    <Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="pagination-ellipsis" aria-hidden="true">…</span>
                      )}
                      <button
                        type="button"
                        className={`pagination-btn pagination-page ${pagination.page === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                        aria-label={`Page ${page}`}
                        aria-current={pagination.page === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    </Fragment>
                  ))}
              </div>

              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.total_pages}
                aria-label="Next page"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </nav>
          )}

          <p className="courses-count" aria-live="polite">
            Showing {courses.length} of {pagination.total} course{pagination.total !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}