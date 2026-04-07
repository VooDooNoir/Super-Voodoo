import React, { useState, useEffect } from 'react';

function ArtStudio() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('landscape');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load persisted gallery on mount
  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        setGallery(data.images || []);
        setGalleryLoading(false);
      })
      .catch(() => {
        setGallery([]);
        setGalleryLoading(false);
      });
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setError('');
    setGeneratedImage(null);
    setGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Generation failed');
      }

      const data = await res.json();

      if (data.success && data.image) {
        setGeneratedImage({ url: data.image, prompt, aspectRatio });
        setSaveSuccess(false);
      } else {
        throw new Error('No image was returned from the generator');
      }
    } catch (err) {
      setError(`Error generating image: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage) return;
    setSaving(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: generatedImage.url,
          prompt: generatedImage.prompt,
          aspectRatio: generatedImage.aspectRatio,
          upscaled: false,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Save failed');
      }

      const entry = await res.json();
      setGallery(prev => [entry, ...prev]);
      setSaveSuccess(true);
      setGeneratedImage(null);
      setPrompt('');
    } catch (err) {
      setError(`Error saving to gallery: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGallery(prev => prev.filter(img => img.id !== id));
      }
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="page art-studio-page">
      <h1>Art Studio</h1>
      <p className="art-studio-subtitle">Generate AI art and save it to your gallery</p>

      {/* Generation Panel */}
      <div className="art-studio-panel">
        <h2>Generate Image</h2>
        <div className="art-studio-form">
          <textarea
            className="art-studio-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={3}
          />
          <div className="art-studio-controls">
            <select
              className="art-studio-select"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
            >
              <option value="landscape">Landscape (16:9)</option>
              <option value="square">Square (1:1)</option>
              <option value="portrait">Portrait (9:16)</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {error && <div className="error-banner" role="alert">{error}</div>}

        {generating && (
          <div className="art-studio-loading">
            <div className="spinner" />
            <p>Creating your masterpiece...</p>
          </div>
        )}

        {generatedImage && !generating && (
          <div className="art-studio-preview">
            <h3>Generated Image</h3>
            <img src={generatedImage.url} alt={generatedImage.prompt} />
            <div className="art-studio-actions">
              <button
                className="btn btn-success"
                onClick={handleSaveToGallery}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save to Gallery'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setGeneratedImage(null); setPrompt(''); }}
              >
                Discard
              </button>
            </div>
            {saveSuccess && <p className="save-success">Image saved to gallery!</p>}
          </div>
        )}
      </div>

      {/* Gallery Panel */}
      <div className="art-studio-panel">
        <h2>Your Gallery</h2>

        {galleryLoading ? (
          <div className="spinner" />
        ) : gallery.length === 0 ? (
          <div className="empty-state">
            <p>No saved images yet.</p>
            <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
              Generate an image above and click "Save to Gallery" to persist it.
            </p>
          </div>
        ) : (
          <div className="art-studio-gallery-grid">
            {gallery.map(img => (
              <div key={img.id} className="gallery-item">
                <img src={img.imageUrl} alt={img.prompt} loading="lazy" />
                <div className="gallery-item-info">
                  <p className="gallery-item-prompt">{img.prompt}</p>
                  <span className="gallery-item-date">
                    {new Date(img.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(img.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArtStudio;
