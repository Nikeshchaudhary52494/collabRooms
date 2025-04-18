import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';
import { executeJavaScript } from '../helpers/vmSandbox.js';
import { createTempFile, cleanupTempFiles } from '../helpers/fileHandling.js';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ExecutionService {
    async executeCode(code, language) {
        if (language === 'javascript') {
            return await executeJavaScript(code);
        }

        const { filePath, filename } = await createTempFile(code, language);
        try {
            return await this.executeOtherLanguage(language, filePath, filename);
        } catch (error) {
            return {
                output: '',
                error: error.message || 'Execution failed'
            };
        } finally {
            await cleanupTempFiles(language, filePath, filename);
        }
    }

    async executeOtherLanguage(language, filePath, filename) {
        const commands = this.getExecutionCommands(language, filePath, filename);

        try {
            // Execute compilation first if needed
            if (commands.compile) {
                console.log(`Compiling with: ${commands.compile}`); // Debug log
                const { stderr: compileError } = await execAsync(commands.compile, {
                    timeout: 5000,
                    cwd: path.dirname(filePath) // Set working directory
                });
                if (compileError) {
                    return { output: '', error: compileError };
                }
            }

            // Then execute the program
            console.log(`Running with: ${commands.run}`); // Debug log
            const { stdout, stderr } = await execAsync(commands.run, {
                timeout: 5000,
                cwd: path.dirname(filePath) // Set working directory
            });

            return {
                output: stdout || 'Program executed successfully with no output',
                error: stderr
            };
        } catch (error) {
            // More detailed error information
            let errorMsg = `Execution Error: ${error.message}`;
            if (error.stderr) errorMsg += `\n${error.stderr}`;
            if (error.stdout) errorMsg += `\n${error.stdout}`;

            return {
                output: '',
                error: errorMsg
            };
        }
    }

    getExecutionCommands = (language, filePath, filename) => {
        const dir = path.dirname(filePath);
        const baseName = path.join(dir, filename);
        const baseOut = `${baseName}.out`;

        const COMMANDS = {
            python: {
                run: `python "${filePath}"`
            },
            java: {
                compile: `javac "${filePath}"`,
                run: `java -cp "${dir}" ${filename}`
            },
            c: {
                compile: `gcc "${filePath}" -o "${baseOut}"`,
                run: `"${baseOut}"`
            },
            cpp: {
                compile: `g++ "${filePath}" -o "${baseOut}"`,
                run: `"${baseOut}"`
            }
        };

        return COMMANDS[language] || { run: `cat "${filePath}"` };
    };
}

export const executionService = new ExecutionService();