import React, { useState } from 'react';
import { useArchitect } from '../context/ArchitectContext';

const SiteEditor = () => {
  const { revisionCount, incrementRevision } = useArchitect();
  const [devNote, setDevNote] = useState('');

  return (
    <div className="dashboard-grid">
      <div className="editor-controls">
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div className="revision-tracker" style={{ marginBottom: '1.5rem' }}>
            <span>Revision: </span>
            <span className="revision-count">{revisionCount}/3</span>
          </div>
          
          <div className="action-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className="btn-flame" 
              onClick={incrementRevision}
              disabled={revisionCount >= 3}
            >
              {revisionCount < 3 ? 'Request AI Revision' : 'AI Revisions Exhausted'}
            </button>
            
            {revisionCount >= 3 && (
              <div className="dev-note-section">
                <div className="dev-note-banner">
                  <strong>⚠️ Limit Reached:</strong>
                  <span>Switching to manual Dev Note pipeline.</span>
                </div>
                <textarea 
                  className="form-input" 
                  style={{ height: '100px', marginBottom: '1rem', resize: 'none' }}
                  placeholder="Describe the exact manual changes you need (e.g. 'Move the CTA button 20px left and make it neon green')..."
                  value={devNote}
                  onChange={(e) => setDevNote(e.target.value)}
                />
                <button className="btn-voodoo" style={{ width: '100%' }} onClick={() => alert('Dev Note sent to engineers!')}>
                  Submit Dev Note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="preview-container">
        <div className="preview-panel">
          <div className="preview-toolbar">
            <div className="preview-dot dot-red" />
            <div className="preview-dot dot-yellow" />
            <div className="preview-dot dot-green" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
              voodoo-preview-site-42.local
            </span>
          </div>
          <iframe 
            src="about:blank" 
            style={{ width: '100%', height: 'calc(100% - 30px)', border: 'none', background: 'white' }} 
            title="Site Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default SiteEditor;
