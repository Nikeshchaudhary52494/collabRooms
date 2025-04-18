export const HELLO_WORLD_SNIPPETS = {
    'javascript': 'console.log("Hello, World!");',
    'typescript': 'console.log("Hello, World!");',
    'python': 'print("Hello, World!")',
    'java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    'c': '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    'cpp': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}'
};

export const FILE_EXTENSIONS = {
    'python': 'py',
    'javascript': 'js',
    'typescript': 'ts',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp'
};

export const CORS_OPTIONS = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
};