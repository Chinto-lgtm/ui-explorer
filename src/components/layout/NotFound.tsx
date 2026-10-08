import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PAGES } from '../../config/routes';
import { BrandMark } from './BrandMark';
import './NotFound.css';

/** Unknown addresses inside the app: say so, and offer every real page. */
export const NotFound: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <div className="not-found-page">
    <div className="not-found">
      <BrandMark size={56} />
      <h1 className="not-found__title">Nothing lives at <code>{pathname}</code></h1>
      <p className="not-found__text">The page may have moved. Pick up from one of these:</p>
      <ul className="not-found__links">
        {PAGES.map((p) => (
          <li key={p.id}>
            <Link to={p.path} className="not-found__link">
              <p.icon size={18} aria-hidden="true" />
              <span><strong>{p.label}</strong><span>{p.description}</span></span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/" className="not-found__home">Back to the landing page</Link>
    </div>
    </div>
  );
};
