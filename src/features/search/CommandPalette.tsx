import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStyle } from '../../hooks/useStyle';
import { Search, Sparkles, LayoutDashboard, Component, Database, Sliders, X } from 'lucide-react';
import './CommandPalette.css';

export const CommandPalette: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { availableStyles, setStyle } = useStyle();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const pages = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={16} /> },
    { name: 'Components Lab', path: '/components', icon: <Component size={16} /> },
    { name: 'Data & Interaction', path: '/data', icon: <Database size={16} /> },
    { name: 'Style Customizer', path: '/customizer', icon: <Sliders size={16} /> }
  ];

  const filteredStyles = availableStyles.filter(
    (s) =>
      s.metadata.name.toLowerCase().includes(query.toLowerCase()) ||
      s.metadata.category.toLowerCase().includes(query.toLowerCase()) ||
      s.metadata.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredPages = pages.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelectStyle = (id: string) => {
    setStyle(id);
    onClose();
  };

  const handleSelectPage = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-row">
          <Search size={18} className="cmd-search-icon" />
          <input
            autoFocus
            type="text"
            placeholder="Type a style name (e.g. Neumorphism, Cyberpunk) or page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="cmd-input"
          />
          <button className="cmd-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="cmd-results">
          {filteredPages.length > 0 && (
            <div className="cmd-group">
              <span className="cmd-group-heading">Navigation Pages</span>
              {filteredPages.map((page) => (
                <div key={page.path} className="cmd-item" onClick={() => handleSelectPage(page.path)}>
                  {page.icon}
                  <span>{page.name}</span>
                </div>
              ))}
            </div>
          )}

          {filteredStyles.length > 0 && (
            <div className="cmd-group">
              <span className="cmd-group-heading">Design Styles ({filteredStyles.length})</span>
              {filteredStyles.map((style) => (
                <div key={style.metadata.id} className="cmd-item" onClick={() => handleSelectStyle(style.metadata.id)}>
                  <Sparkles size={16} className="cmd-item-icon" />
                  <div className="cmd-item-info">
                    <span className="cmd-item-title">{style.metadata.name}</span>
                    <span className="cmd-item-desc">{style.metadata.description}</span>
                  </div>
                  <span className="cmd-item-badge">{style.metadata.category}</span>
                </div>
              ))}
            </div>
          )}

          {filteredPages.length === 0 && filteredStyles.length === 0 && (
            <div className="cmd-empty">No matching styles or pages found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
