import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { FILE_EXTENSIONS } from '../config/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getFileExtension(language) {
    return FILE_EXTENSIONS[language] || 'txt';
}

export async function createTempFile(code, language) {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Extract Java class name if needed
    const filename = language === 'java' ?
        extractJavaClassName(code) || `Main${Date.now()}` :
        `temp-${Date.now()}`;

    const extension = getFileExtension(language);
    const tempFile = path.join(tempDir, `${filename}.${extension}`);

    fs.writeFileSync(tempFile, code);
    return { filePath: tempFile, filename };
}

export async function cleanupTempFiles(language, filePath, filename) {
    const dir = path.dirname(filePath);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Clean up compiled files
        if (language === 'c' || language === 'cpp') {
            const outFile = path.join(dir, `${filename}.out`);
            if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
        }

        if (language === 'java') {
            const classFile = path.join(dir, `${filename}.class`);
            if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
        }
    } catch (e) {
        console.error('Cleanup error:', e.message);
    }
}

function extractJavaClassName(code) {
    try {
        const classRegex = /public\s+class\s+(\w+)/;
        const match = code.match(classRegex);
        return match ? match[1] : null;
    } catch (e) {
        console.log('Error extracting Java class name:', e.message);
        return null;
    }
}