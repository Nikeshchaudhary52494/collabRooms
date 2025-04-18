import vm from 'vm';

export function executeJavaScript(code) {
    return new Promise((resolve) => {
        let output = '';
        const context = {
            console: {
                log: (...args) => {
                    output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n';
                },
                error: (...args) => {
                    output += 'ERROR: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n';
                },
                warn: (...args) => {
                    output += 'WARN: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n';
                }
            },
            process: {
                exit: () => { output += 'ERROR: process.exit() blocked\n'; },
                kill: () => { output += 'ERROR: process.kill() blocked\n'; }
            },
            setTimeout: () => { output += 'ERROR: setTimeout() blocked\n'; },
            setInterval: () => { output += 'ERROR: setInterval() blocked\n'; },
            Math: Math,
            Date: Date,
            JSON: JSON
        };

        vm.createContext(context);

        try {
            const script = new vm.Script(code, { timeout: 3000 });
            script.runInContext(context);
            resolve({ output, error: '' });
        } catch (e) {
            resolve({ output: '', error: e.message });
        }
    });
}