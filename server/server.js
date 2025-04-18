import { server } from './app.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { HELLO_WORLD_SNIPPETS } from './config/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Supported languages:', Object.keys(HELLO_WORLD_SNIPPETS));
});

// Clean up temp directory on exit
process.on('exit', () => {
    const tempDir = path.join(__dirname, 'temp');
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
    }
});

process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());