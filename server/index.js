const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Track rooms and users
const rooms = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    // Join a room (classroom)
    socket.on('join-room', (roomId, userRole) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                teacher: userRole === 'teacher' ? socket.id : null,
                students: userRole === 'student' ? [socket.id] : [],
                code: ''
            };
        } else {
            if (userRole === 'teacher') {
                rooms[roomId].teacher = socket.id;
            } else if (!rooms[roomId].students.includes(socket.id)) {
                rooms[roomId].students.push(socket.id);
            }
        }

        // Send current code to new user
        socket.emit('code-update', rooms[roomId].code);
    });

    // Handle code changes
    socket.on('code-change', (roomId, newCode) => {
        if (rooms[roomId]) {
            rooms[roomId].code = newCode;
            socket.to(roomId).emit('code-update', newCode);
        }
    });

    socket.on('language-change', (roomId, newLanguage) => {
        if (rooms[roomId]) {
            rooms[roomId].language = newLanguage;
            socket.to(roomId).emit('language-update', newLanguage);
        }
    });

    // Handle execution requests
    socket.on('execute-code', async (roomId, code, language) => {
        if (!rooms[roomId] || socket.id !== rooms[roomId].teacher) {
            return socket.emit('execution-error', 'Only teacher can execute code');
        }

        try {
            const result = await executeCode(code, language);
            const executionResult = {
                ...result,
                timestamp: new Date()
            };
            io.to(roomId).emit('execution-result', executionResult);
        } catch (error) {
            socket.emit('execution-error', error ? error.message : 'Execution failed');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Execute code on teacher's machine
async function executeCode(code, language) {
    return new Promise((resolve, reject) => {
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const tempFile = path.join(tempDir, `temp-${Date.now()}.${getFileExtension(language)}`);
        fs.writeFileSync(tempFile, code);

        const command = getExecutionCommand(language, tempFile);

        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            // Clean up temp file
            fs.unlink(tempFile, () => { });

            if (error) {
                return reject(new Error(stderr || 'Execution failed'));
            }

            resolve({
                output: stdout,
                error: stderr
            });
        });
    });
}

function getFileExtension(language) {
    const extensions = {
        'python': 'py',
        'javascript': 'js',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp'
    };
    return extensions[language] || 'txt';
}

function getExecutionCommand(language, filePath) {
    const commands = {
        'python': `python "${filePath}"`,
        'javascript': `node "${filePath}"`,
        'java': `javac "${filePath}" && java -cp "${path.dirname(filePath)}" "${path.basename(filePath, '.java')}"`,
        'c': `gcc "${filePath}" -o "${filePath}.out" && "${filePath}.out"`,
        'cpp': `g++ "${filePath}" -o "${filePath}.out" && "${filePath}.out"`
    };
    return commands[language] || `cat "${filePath}"`;
}

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});