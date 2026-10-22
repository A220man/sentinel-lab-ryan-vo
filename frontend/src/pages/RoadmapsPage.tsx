import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Loading, ErrorState, EmptyState, PageHeader } from '../components/StateComponents.tsx';
import type { Roadmap } from '../types';
import './RoadmapsPage.css';

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getRoadmaps();
        setRoadmaps(data);
      } catch (err) {
        setError('Failed to load roadmaps. Please try again.');
        console.error('Error fetching roadmaps:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  if (loading) {
    return <Loading size="lg" message="Loading roadmaps..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="roadmaps-page">
      <PageHeader
        title="Learning Roadmaps"
        description="Structured learning paths to master LLMs and AI"
      />

      {roadmaps.length === 0 ? (
        <EmptyState
          title="No roadmaps available"
          message="Check back soon for curated learning paths."
        />
      ) : (
        <div className="roadmaps-grid" role="list" aria-label="Learning roadmaps">
          {roadmaps.map((roadmap) => (
            <article key={roadmap.id} className="roadmap-card">
              <Link to={`/roadmaps/${roadmap.id}`} className="roadmap-card-link">
                <div className="roadmap-card-header">
                  <h3 className="roadmap-card-title">{roadmap.title}</h3>
                  {roadmap.estimated_hours && (
                    <span className="roadmap-card-duration">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      ~{roadmap.estimated_hours}h
                    </span>
                  )}
                </div>
                {roadmap.description && (
                  <p className="roadmap-card-description">{roadmap.description}</p>
                )}
                {roadmap.target_audience && (
                  <p className="roadmap-card-audience">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    For {roadmap.target_audience}
                  </p>
                )}
                <div className="roadmap-card-steps">
                  <span className="roadmap-card-steps-count">{roadmap.steps.length}</span>
                  <span className="roadmap-card-steps-label">step{roadmap.steps.length !== 1 ? 's' : ''}</span>
                </div>
              </Link>
              <div className="roadmap-card-preview">
                {roadmap.steps.slice(0, 3).map((step, index) => (
                  <div key={step.id} className="roadmap-step-preview">
                    <span className="roadmap-step-number">{index + 1}</span>
                    <span className="roadmap-step-title">{step.title}</span>
                    {step.course_id && (
                      <span className="roadmap-step-course">📚 Course</span>
                    )}
                  </div>
                ))}
                {roadmap.steps.length > 3 && (
                  <div className="roadmap-step-more">+{roadmap.steps.length - 3} more steps</div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}