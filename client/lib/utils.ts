import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const helloWorldSnippets: Record<
  'javascript' | 'typescript' | 'python' | 'java' | 'c' | 'cpp',
  string
> = {
  javascript: `console.log("Hello, World!");`,

  typescript: `const message: string = "Hello, World!";
console.log(message);`,

  python: `print("Hello, World!")`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,

  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
};
