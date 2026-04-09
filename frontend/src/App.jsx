import React, { useState } from 'react';
import { ArchitectProvider } from './context/ArchitectContext';
import ProjectDashboard from './components/ProjectDashboard';
import BrandInterview from './components/BrandInterview';
import SiteEditor from './components/SiteEditor';
import Billing from './pages/Billing';

const App = () => {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'interview', 'editor', 'billing'
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setView('editor');
  };

  return (
    <ArchitectProvider>
      <div className="app-container">
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '3rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--bg-glass-border)' 
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: 'var(--voodoo-purple)',
            textShadow: '0 0 10px rgba(139, 49, 160, 0.5)'
          }}>
            VOODOO ARCHITECT
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn-voodoo" 
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className="btn-voodoo" 
              onClick={() => setView('billing')}
            >
              Billing
            </button>
            <button 
              className="btn-flame" 
              onClick={() => setView('interview')}
            >
              New Project
            </button>
          </div>
        </header>

        {view === 'dashboard' && (
          <ProjectDashboard onSelectProject={handleSelectProject} />
        )}
        
        {view === 'interview' && (
          <BrandInterview />
        )}
        
        {view === 'editor' && (
          <SiteEditor />
        )}

        {view === 'billing' && (
          <Billing />
        )}
      </div>
    </ArchitectProvider>
  );
};

export default App;
