import React from 'react';
import { useArchitect } from '../context/ArchitectContext';

const BrandInterview = () => {
  const { interviewStep, setInterviewStep, brandData, updateBrandData } = useArchitect();

  const steps = [
    { 
      id: 1, 
      title: 'Brand Voice', 
      question: 'How should your brand sound?', 
      placeholder: 'e.g. Professional but edgy, minimal, aggressive, ethereal...', 
      field: 'voice' 
    },
    { 
      id: 2, 
      title: 'Target Audience', 
      question: 'Who are we building this for?', 
      placeholder: 'e.g. Gen Z gamers, high-net-worth investors, tech-savvy artisans...', 
      field: 'audience' 
    },
    { 
      id: 3, 
      title: 'Primary Call to Action', 
      question: 'What is the one goal of the site?', 
      placeholder: 'e.g. Book a consultation, Buy the limited drop, Join the waitlist...', 
      field: 'cta' 
    },
  ];

  const currentStep = steps[interviewStep - 1];

  const handleNext = () => {
    if (interviewStep < steps.length) {
      setInterviewStep(interviewStep + 1);
    } else {
      // Finish interview
      alert('Brand Kit generated! Initializing Voodoo Architect...');
    }
  };

  return (
    <div className="interview-container glass-card">
      <div className="step-indicator">
        {steps.map(step => (
          <div 
            key={step.id} 
            className={`step-dot ${step.id <= interviewStep ? 'active' : ''}`} 
          />
        ))}
      </div>
      
      <h2 style={{ marginBottom: '1rem' }}>{currentStep.title}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{currentStep.question}</p>
      
      <div className="form-group">
        <input 
          className="form-input" 
          placeholder={currentStep.placeholder}
          value={brandData[currentStep.field]}
          onChange={(e) => updateBrandData(currentStep.field, e.target.value)}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button 
          className="btn-voodoo" 
          style={{ opacity: interviewStep === 1 ? 0.5 : 1 }}
          disabled={interviewStep === 1}
          onClick={() => setInterviewStep(interviewStep - 1)}
        >
          Back
        </button>
        <button className="btn-flame" onClick={handleNext}>
          {interviewStep === steps.length ? 'Generate Site' : 'Next Step'}
        </button>
      </div>
    </div>
  );
};

export default BrandInterview;
