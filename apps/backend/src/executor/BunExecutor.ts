import { spawn } from 'child_process';

import { BaseExecutor } from './BaseExecutor.js';
import { createTempFile, cleanupTempFile, parseExecutionOutput } from '../utils/index.js';

import type { ExecutionResult, Language } from '../types/index.js';

/**
 * Executor for JavaScript and TypeScript using Bun runtime
 */
export class BunExecutor extends BaseExecutor {
  constructor(language: Language) {
    if (language !== 'javascript' && language !== 'typescript') {
      throw new Error(`BunExecutor only supports JavaScript and TypeScript, got: ${language}`);
    }
    super(language);
  }

  getFileExtension(): string {
    return this.language === 'typescript' ? '.ts' : '.js';
  }

  async validateRuntime(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('bun', ['--version']);
      proc.on('close', (code) => {
        resolve(code === 0);
      });
      proc.on('error', () => {
        resolve(false);
      });
    });
  }

  async execute(code: string, timeout: number = 5000): Promise<ExecutionResult> {
    const startTime = Date.now();
    let tempFile: string | null = null;

    try {
      // Create temporary file
      tempFile = await createTempFile(code, this.getFileExtension());

      // Execute with Bun
      const result = await this.runBun(tempFile, timeout);

      const executionTime = Date.now() - startTime;

      if (result.error) {
        return {
          success: false,
          error: result.error,
          executionTime,
        };
      }

      return {
        success: true,
        output: parseExecutionOutput(result.output),
        executionTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      };
    } finally {
      if (tempFile) {
        await cleanupTempFile(tempFile);
      }
    }
  }

  private runBun(filepath: string, timeout: number): Promise<{ output: string; error?: string }> {
    return new Promise((resolve) => {
      const proc = spawn('bun', ['run', filepath], {
        timeout,
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ output: stdout });
        } else {
          resolve({ output: stdout, error: stderr || `Process exited with code ${code}` });
        }
      });

      proc.on('error', (err) => {
        resolve({ output: '', error: err.message });
      });
    });
  }
}
