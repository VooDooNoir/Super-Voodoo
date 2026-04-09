const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Neon DB URL
});

const db = {
  async createProject(name, url) {
    const res = await pool.query(
      'INSERT INTO projects (name, url) VALUES ($1, $2) RETURNING *',
      [name, url]
    );
    return res.rows[0];
  },

  async saveRevision(projectId, content, brandProfile, version) {
    const res = await pool.query(
      'INSERT INTO revisions (project_id, content, brand_profile, version_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [projectId, JSON.stringify(content), JSON.stringify(brandProfile), version]
    );
    return res.rows[0];
  },

  async recordDeployment(projectId, url, method, status, error = null) {
    const res = await pool.query(
      'INSERT INTO deployments (project_id, deployment_url, method, status, error_message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [projectId, url, method, status, error]
    );
    return res.rows[0];
  }
};

module.exports = db;
