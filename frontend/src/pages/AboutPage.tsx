import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About Sentinel Lab</h1>
        <p className="about-tagline">Your guided journey into Large Language Models</p>
      </section>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          Sentinel Lab is an open educational platform designed to help developers,
          researchers, and enthusiasts learn about Large Language Models (LLMs) through
          structured courses, hands-on Colab notebooks, and curated learning roadmaps.
        </p>
        <p>
          Inspired by the excellent <a href="https://github.com/mlabonne/llm-course" target="_blank" rel="noopener noreferrer">mlabonne/llm-course</a>,
          we aim to provide a modern, interactive learning experience with:
        </p>
        <ul>
          <li>Structured courses with modules and lessons</li>
          <li>Direct links to Google Colab notebooks for hands-on practice</li>
          <li>Learning roadmaps for different career paths</li>
          <li>Progress tracking and personalized recommendations</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Course Structure</h2>
        <div className="course-structure">
          <div className="structure-item">
            <div className="structure-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3>Courses</h3>
            <p>Comprehensive learning paths covering LLM fundamentals, fine-tuning, RAG, and more.</p>
          </div>
          <div className="structure-item">
            <div className="structure-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Modules</h3>
            <p>Logical groupings of related lessons within a course.</p>
          </div>
          <div className="structure-item">
            <div className="structure-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Lessons</h3>
            <p>Individual learning units: Colab notebooks, videos, articles, or exercises.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Roadmaps</h2>
        <p>
          Learning roadmaps provide structured paths for specific goals such as becoming
          an LLM Engineer, ML Researcher, or AI Product Manager. Each roadmap consists
          of ordered steps that may reference courses, external resources, or milestones.
        </p>
      </section>

      <section className="about-section">
        <h2>Technology Stack</h2>
        <div className="tech-stack">
          <div className="tech-item">
            <strong>Backend:</strong> FastAPI, SQLAlchemy, SQLite
          </div>
          <div className="tech-item">
            <strong>Frontend:</strong> React 18, TypeScript, Vite
          </div>
          <div className="tech-item">
            <strong>Auth:</strong> Keycloak (OIDC), PKCE
          </div>
          <div className="tech-item">
            <strong>Deployment:</strong> Docker, docker-compose
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Contributing</h2>
        <p>
          Sentinel Lab is open source. Contributions are welcome!
          Check out the <a href="https://github.com/A220man/sentinel-lab-ryan-vo" target="_blank" rel="noopener noreferrer">GitHub repository</a>
          for issues, feature requests, and pull requests.
        </p>
      </section>

      <section className="about-section">
        <h2>Contact</h2>
        <p>
          Created by <strong>Ryan Vo</strong> (<a href="mailto:ryandtvo@gmail.com">ryandtvo@gmail.com</a>)
        </p>
        <p>
          GitHub: <a href="https://github.com/A220man" target="_blank" rel="noopener noreferrer">A220man</a>
        </p>
      </section>

      <footer className="about-footer">
        <p>Sentinel Lab - LLM Course Platform</p>
        <p>Built with ❤️ for the AI/ML community</p>
      </footer>
    </div>
  );
}