import React, { useState } from 'react';

const Billing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annually'

  const tiers = [
    {
      name: 'Creator',
      price: billingCycle === 'monthly' ? '$19' : '$15',
      features: ['All platforms', 'Analytics'],
      buttonText: 'Select Tier',
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      features: ['White-label', 'Priority support'],
      buttonText: 'Select Tier',
    },
    {
      name: 'Agency',
      price: billingCycle === 'monthly' ? '$149' : '$119',
      features: ['Custom branding', 'API access'],
      buttonText: 'Select Tier',
    }
  ];

  return (
    <div className="billing-container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--voodoo-purple)' }}>Voodoo Tiers</h2>
        
        <div style={{ 
          display: 'inline-flex', 
          background: 'var(--bg-glass)', 
          padding: '4px', 
          borderRadius: '100px',
          border: '1px solid var(--bg-glass-border)'
        }}>
          <button 
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '100px',
              border: 'none',
              background: billingCycle === 'monthly' ? 'var(--voodoo-purple)' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBillingCycle('annually')}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '100px',
              border: 'none',
              background: billingCycle === 'annually' ? 'var(--voodoo-purple)' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              position: 'relative'
            }}
          >
            Annually
            <span style={{ 
              position: 'absolute', 
              top: '-15px', 
              right: '-10px', 
              fontSize: '0.7rem', 
              background: 'var(--flame-orange)', 
              padding: '2px 8px', 
              borderRadius: '10px' 
            }}>
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '2rem' 
      }}>
        {tiers.map((tier) => (
          <div key={tier.name} className="glass-card" style={{ 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.3s',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{tier.name}</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: '700' }}>{tier.price}</span>
              <span style={{ color: 'var(--text-muted)' }}>/mo</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', flex: 1 }}>
              {tier.features.map((feature) => (
                <li key={feature} style={{ 
                  marginBottom: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{ color: 'var(--voodoo-purple)' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="btn-voodoo" style={{ width: '100%' }}>
              {tier.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Billing;
