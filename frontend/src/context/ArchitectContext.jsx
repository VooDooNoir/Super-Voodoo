import React, { createContext, useContext, useState } from 'react';

const ArchitectContext = createContext();

export const ArchitectProvider = ({ children }) => {
  const [projects, setProjects] = useState([
    { id: '1', name: 'Neon Tokyo Cafe', status: 'Deployed', revisions: 1, url: 'https://neon-tokyo.voodoo.site' },
    { id: '2', name: 'Cyber Pulse Gym', status: 'Draft', revisions: 3, url: '' },
    { id: '3', name: 'Void Archive', status: 'Draft', revisions: 0, url: '' },
  ]);
  
  const [currentProject, setCurrentProject] = useState(null);
  const [revisionCount, setRevisionCount] = useState(0);
  const [interviewStep, setInterviewStep] = useState(1);
  const [brandData, setBrandData] = useState({
    voice: '',
    audience: '',
    cta: '',
  });

  const updateBrandData = (key, value) => {
    setBrandData(prev => ({ ...prev, [key]: value }));
  };

  const incrementRevision = () => {
    setRevisionCount(prev => prev + 1);
  };

  return (
    <ArchitectContext.Provider value={{
      projects,
      setProjects,
      currentProject,
      setCurrentProject,
      revisionCount,
      setRevisionCount,
      incrementRevision,
      interviewStep,
      setInterviewStep,
      brandData,
      updateBrandData,
    }}>
      {children}
    </ArchitectContext.Provider>
  );
};

export const useArchitect = () => useContext(ArchitectContext);
