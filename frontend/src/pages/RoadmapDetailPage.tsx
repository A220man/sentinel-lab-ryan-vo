import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Loading, ErrorState, EmptyState, PageHeader } from '../components/StateComponents.tsx';
import type { Roadmap, RoadmapStep, RoadmapRecommendationRequest, RoadmapRecommendationResponse } from '../types';
import './RoadmapDetailPage.css';

export default function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const roadmapId = Number(id);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [recommendation, setRecommendation] = useState<RoadmapRecommendationResponse | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRoadmap(roadmapId);
      setRoadmap(data);
    } catch (err) {
      setError('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  }, [roadmapId]);

  const fetchRecommendation = useCallback(async () => {
    try {
      const request: RoadmapRecommendationRequest = {
        completed_step_ids: Array.from(completedSteps),
      };
      const data = await api.recommendNextStep(roadmapId, request);
      setRecommendation(data);
    } catch (err) {
      console.error('Failed to fetch recommendation:', err);
    }
  }, [roadmapId, completedSteps]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  useEffect(() => {
    if (roadmap) {
      fetchRecommendation();
    }
  }, [roadmap, fetchRecommendation]);

  // Load persisted completed steps from localStorage
  useEffect(() => {
    const key = `sentinel-lab-roadmap-${roadmapId}-completedSteps`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setCompletedSteps(new Set(JSON.parse(stored)));
    } else {
      setCompletedSteps(new Set());
    }
  }, [roadmapId]);


  const toggleStep = (stepId: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      // Persist to localStorage
      const key = `sentinel-lab-roadmap-${roadmapId}-completedSteps`;
      if (next.size === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify([...next]));
      }
      return next;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendation();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading size="lg" message="Loading roadmap..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchRoadmap} />;
  }

  if (!roadmap) {
    return <EmptyState title="Roadmap not found" message="The roadmap you're looking for doesn't exist." />;
  }

  const steps = roadmap.steps?.sort((a, b) => a.order - b.order) || [];
  const totalSteps = steps.length;
  const completedCount = completedSteps.size;
  const progressPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const isNextStep = (step: RoadmapStep) => recommendation?.next_step?.id === step.id;

  return (
    <div className="roadmap-detail-page">
      <PageHeader
        title={roadmap.title}
        description={roadmap.description || undefined}
      />

      <div className="roadmap-detail-content">
        <aside className="roadmap-sidebar">
          <div className="roadmap-meta">
            {roadmap.target_audience && (
              <div className="meta-item">
                <span className="meta-label">Target Audience</span>
                <span className="meta-value">{roadmap.target_audience}</span>
              </div>
            )}
            {roadmap.estimated_hours && (
              <div className="meta-item">
                <span className="meta-label">Estimated Hours</span>
                <span className="meta-value">{roadmap.estimated_hours}h</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">Total Steps</span>
              <span className="meta-value">{totalSteps}</span>
            </div>
          </div>

          <div className="progress-section">
            <h3>Your Progress</h3>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="progress-text">
              {completedCount} of {totalSteps} steps completed ({progressPercentage}%)
            </p>
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh recommendation"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Recommendation'}
            </button>
          </div>

          {recommendation?.next_step && (
            <div className="recommendation-card">
              <h3>Recommended Next Step</h3>
              <div className="recommendation-step">
                <span className="step-badge required">{recommendation.next_step.is_required ? 'Required' : 'Optional'}</span>
                <h4>{recommendation.next_step.title}</h4>
                {recommendation.next_step.description && (
                  <p>{recommendation.next_step.description}</p>
                )}
                {recommendation.next_course && (
                  <Link to={`/courses/${recommendation.next_course.id}`} className="course-link">
                    View Course: {recommendation.next_course.title}
                  </Link>
                )}
              </div>
            </div>
          )}

          {!recommendation?.next_step && totalSteps > 0 && (
            <div className="recommendation-card complete">
              <h3>Roadmap Complete!</h3>
              <p>You've completed all steps in this roadmap.</p>
            </div>
          )}
        </aside>

        <main className="roadmap-main">
          {steps.length === 0 ? (
            <EmptyState
              title="No steps yet"
              message="This roadmap doesn't have any steps. Add steps to get started."
            />
          ) : (
            <ol className="roadmap-steps" role="list" aria-label="Roadmap steps">
              {steps.map((step) => (
                <li
                  key={step.id}
                  className={`step-item ${completedSteps.has(step.id) ? 'completed' : ''} ${isNextStep(step) ? 'recommended' : ''}`}
                >
                  <div className="step-content">
                    <label className="step-checkbox">
                      <input
                        type="checkbox"
                        checked={completedSteps.has(step.id)}
                        onChange={() => toggleStep(step.id)}
                        aria-label={`Mark step "${step.title}" as ${completedSteps.has(step.id) ? 'incomplete' : 'complete'}`}
                      />
                      <span className="checkmark" aria-hidden="true" />
                    </label>
                    <div className="step-info">
                      <div className="step-header">
                        <span className="step-order">Step {step.order}</span>
                        <h3 className="step-title">{step.title}</h3>
                        <span className={`step-badge ${step.is_required ? 'required' : 'optional'}`}>
                          {step.is_required ? 'Required' : 'Optional'}
                        </span>
                        {isNextStep(step) && <span className="step-badge recommended">Next</span>}
                      </div>
                      {step.description && (
                        <p className="step-description">{step.description}</p>
                      )}
                      {step.course_id && (
                        <Link to={`/courses/${step.course_id}`} className="step-course-link">
                          View Course
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </main>
      </div>
    </div>
  );
}
