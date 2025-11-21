import { randomBytes } from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Create a temporary file with the given content
 */
export async function createTempFile(content: string, extension: string): Promise<string> {
  const filename = `temp_${randomBytes(8).toString('hex')}${extension}`;
  const filepath = join(tmpdir(), filename);
  await writeFile(filepath, content, 'utf-8');
  return filepath;
}

/**
 * Clean up a temporary file
 */
export async function cleanupTempFile(filepath: string): Promise<void> {
  try {
    await unlink(filepath);
  } catch {
    // Ignore errors during cleanup
    console.warn(`Failed to cleanup temp file: ${filepath}`);
  }
}

/**
 * Parse JSON output from code execution
 */
export function parseExecutionOutput(output: string): unknown {
  try {
    // Try to parse as JSON first
    return JSON.parse(output.trim());
  } catch {
    // If JSON parsing fails, return the raw output
    return output.trim();
  }
}

/**
 * Sanitize code before execution (basic safety check)
 */
export function sanitizeCode(code: string, language: string): { safe: boolean; reason?: string } {
  const dangerous = {
    javascript: [
      /require\s*\(\s*['"]fs['"]/,
      /require\s*\(\s*['"]child_process['"]/,
      /import\s+.*\s+from\s+['"]fs['"]/,
      /import\s+.*\s+from\s+['"]child_process['"]/,
      /eval\s*\(/,
      /Function\s*\(/,
    ],
    python: [
      /import\s+os/,
      /import\s+subprocess/,
      /import\s+sys/,
      /from\s+os\s+import/,
      /from\s+subprocess\s+import/,
      /eval\s*\(/,
      /exec\s*\(/,
      /__import__/,
    ],
  };

  const patterns = language === 'python' ? dangerous.python : dangerous.javascript;

  for (const pattern of patterns) {
    if (pattern.test(code)) {
      return {
        safe: false,
        reason: `Potentially dangerous code detected: ${pattern.source}`,
      };
    }
  }

  return { safe: true };
}
