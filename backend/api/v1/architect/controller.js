const { spawn } = require('child_process');
const path = require('path');

/**
 * Helper to execute a python script and return the JSON output.
 */
function runPythonScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [scriptPath, ...args]);
        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python script exited with code ${code}: ${stderr}`));
            }
            try {
                resolve(JSON.parse(stdout));
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${stdout}`));
            }
        });
    });
}

const SCRAPER_PATH = path.join(__dirname, '../../../voodoo_architect/scraper/scraper.py');
const GENERATOR_PATH = path.join(__dirname, '../../../voodoo_architect/generator/generator_cli.py');
const MAIN_PATH = path.join(__dirname, '../../../voodoo_architect/main.py');

const architectController = {
    async scrape(req, res) {
        try {
            const { url } = req.body;
            if (!url) return res.status(400).json({ error: 'URL is required' });

            // We use main.py or call scraper.py directly. 
            // Given the structure, let's assume we call a wrapper script or modify scraper.py to be CLI friendly.
            // For now, let's implement a call to a dedicated CLI wrapper if needed, 
            // or assume the scripts handle sys.argv.
            
            const result = await runPythonScript(SCRAPER_PATH, [url]);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async generate(req, res) {
        try {
            const { scrapedData, brandProfile } = req.body;
            if (!scrapedData || !brandProfile) {
                return res.status(400).json({ error: 'Scraped data and brand profile are required' });
            }

            // Pass as JSON strings to the generator
            const result = await runPythonScript(GENERATOR_PATH, [
                JSON.stringify(scrapedData),
                JSON.stringify(brandProfile)
            ]);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deploy(req, res) {
        try {
            const { files, method, projectId } = req.body;
            if (!files || !method) {
                return res.status(400).json({ error: 'Files and deployment method are required' });
            }

            // We'll use a small python wrapper for the DeploymentService
            const deployScript = path.join(__dirname, '../../../voodoo_architect/backend/deploy_wrapper.py');
            const result = await runPythonScript(deployScript, [
                method,
                JSON.stringify(files),
                projectId || 'default'
            ]);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = architectController;
