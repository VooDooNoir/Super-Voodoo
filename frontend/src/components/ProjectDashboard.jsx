import React from 'react';
import { useArchitect } from '../context/ArchitectContext';

const ProjectDashboard = ({ onSelectProject }) => {
  const { projects } = useArchitect();

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Your Projects
        <button className="btn-voodoo btn-sm" style={{ fontSize: '0.8rem' }}>+ New Project</button>
      </h2>
      <div className="project-list">
        {projects.map(project => (
          <div 
            key={project.id} 
            className="project-card" 
            onClick={() => onSelectProject(project)}
          >
            <div className="project-info">
              <h3>{project.name}</h3>
              <p>{project.status} • {project.revisions} Revisions</p>
            </div>
            <div className="project-actions">
              <span style={{ color: 'var(--voodoo-purple)', fontWeight: 'bold' }}>Open →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboard;
