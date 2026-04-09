const express = require('express');
const app = express();
const architectRoutes = require('./api/v1/architect/routes');

app.use(express.json());

// Mount Voodoo Architect routes
app.use('/api/v1/architect', architectRoutes);

// Mock other routes for the sake of the demo/integration
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Voodoo Architect Backend running on port ${PORT}`);
});
