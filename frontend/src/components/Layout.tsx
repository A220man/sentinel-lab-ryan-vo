import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Courses' },
    { path: '/roadmaps', label: 'Roadmaps' },
    { path: '/about', label: 'About' },
  ];

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo" aria-label="Sentinel Lab Home">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#2563eb"/>
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sentinel Lab</span>
          </Link>
          <nav className="nav" aria-label="Main navigation">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="main" role="main">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>Sentinel Lab - LLM Course Platform by Ryan Vo</p>
          <p className="footer-links">
            <a href="https://github.com/A220man/sentinel-lab-ryan-vo" target="_blank" rel="noopener noreferrer">GitHub</a>
            <span aria-hidden="true">·</span>
            <a href="mailto:ryandtvo@gmail.com">Contact</a>
          </p>
        </div>
      </footer>
    </div>
  );
}