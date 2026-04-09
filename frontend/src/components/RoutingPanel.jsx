import React, { useState, useEffect } from 'react';

function RoutingPanel() {
  const [tiers, setTiers] = useState({});
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [tier, setTier] = useState('standard');
  const [loading, setLoading] = useState(false);
  const userId = 'demo-user-001';

  useEffect(() => {
    fetch('http://localhost:3002/routing/models')
      .then(res => res.json())
      .then(data => setTiers(data))
      .catch(() => {
        // Fallback mock data
        setTiers({
          standard: { label: 'Standard', maxTokens: 8192, models: [
            { id: 'nousresearch/hermes-3-llama-3.1-70b', priority: 1, status: 'healthy' },
          ]},
          premium: { label: 'Premium', maxTokens: 32768, models: [
            { id: 'nousresearch/hermes-3-llama-3.1-405b', priority: 1, status: 'unknown' },
          ]},
        });
      });
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    const userMsg = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3002/routing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tier,
          messages: [userMsg],
        }),
      });
      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Response error' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Agent Model Routing</h1>
      <p style={{ color: '#666' }}>Tier-aware multi-model routing via OpenRouter</p>

      {/* Tier Selector */}
      <div className="routing-panel" style={{ marginTop: '1rem' }}>
        <h3>Tier Selector</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {Object.keys(tiers).map(tierKey => (
            <button
              key={tierKey}
              className={`btn ${tier === tierKey ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTier(tierKey)}
            >
              {tiers[tierKey]?.label} ({tierKey})
              <span className={`tier-badge tier-${tierKey === 'standard' ? '2' : '3'}`}>
                {tiers[tierKey]?.maxTokens} tokens
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Model Availability */}
      {tiers[tier] && (
        <div className="routing-panel">
          <h3>Model Chain — {tiers[tier]?.label}</h3>
          {(tiers[tier]?.models || []).map(m => (
            <div key={m.id} className="model-row">
              <div>
                <span className={`status-dot ${m.status}`} />
                <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>{m.id}</span>
              </div>
              <span style={{ color: '#888', fontSize: '0.85rem' }}>Priority {m.priority}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chat Interface */}
      <div className="routing-panel">
        <h3>Test Chat</h3>
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: '1rem 0' }}>
          {messages.length === 0 && <p style={{ color: '#888' }}>Send a message to test model routing...</p>}
          {messages.map((m, i) => (
            <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <strong>{m.role === 'user' ? 'You' : 'Model'}:</strong> {m.content}
            </div>
          ))}
          {loading && <div className="spinner" style={{ margin: '0.5rem' }} />}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '0.5rem', borderRadius: 4, border: '1px solid #e5e5e5' }}
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default RoutingPanel;