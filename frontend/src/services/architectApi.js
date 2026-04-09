export const architectAPI = {
  async buildSite(url) {
    const res = await fetch(`${API_BASE}/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Site build failed');
    }
    return res.json();
  },
};