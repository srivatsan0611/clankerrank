# AI LeetCode Generator

An AI-powered coding problem generator built with Vercel AI SDK and Bun. This tool generates LeetCode-style coding problems complete with solutions and comprehensive test cases.

## Features

- **AI-Powered Generation**: Uses LLMs to generate realistic coding problems
- **Complete Pipeline**:
  1. Generate problem description
  2. Generate optimal solution
  3. Generate test cases as natural language
  4. Convert test cases to executable code
  5. Execute code to create actual test inputs and expected outputs
- **Multi-Language Support**: JavaScript, TypeScript, and Python
- **Test Validation**: Run user solutions against generated test cases
- **Modular Architecture**: Easy to extend with web UI or API server

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Python 3.x (if generating/testing Python problems)
- API key for your chosen LLM provider (Anthropic, OpenAI, etc.)

## Installation

```bash
bun install
```

## Environment Setup

Set up your API key as an environment variable:

```bash
# For Anthropic Claude
export ANTHROPIC_API_KEY="your-api-key"

# For OpenAI
export OPENAI_API_KEY="your-api-key"
```

## Usage

### Generate a New Problem

```bash
bun run index.ts generate [options]
```

**Options:**

- `--model <string>`: AI model to use (e.g., "anthropic/claude-haiku-4.5", "openai/gpt-4")
- `--difficulty <level>`: Problem difficulty: `easy`, `medium`, `hard` (default: medium)
- `--language <lang>`: Target language: `javascript`, `typescript`, `python` (default: javascript)
- `--topic <string>`: Problem topic (e.g., "arrays", "dynamic programming")
- `--tests <number>`: Number of test cases to generate (default: 10)
- `--samples <number>`: Number of visible sample test cases (default: 3)
- `--output <file>`: Save problem to JSON file

**Example:**

```bash
bun run index.ts generate \
  --model "anthropic/claude-haiku-4.5" \
  --difficulty medium \
  --language javascript \
  --topic "arrays" \
  --output problem.json
```

### Test a Solution

```bash
bun run index.ts solve [options]
```

**Options:**

- `--problem <file>`: Path to problem JSON file (required)
- `--solution <file>`: Path to solution file (required)
- `--language <lang>`: Solution language: `javascript`, `typescript`, `python` (required)
- `--show-hidden`: Show results of hidden test cases

**Example:**

```bash
bun run index.ts solve \
  --problem problem.json \
  --solution my-solution.js \
  --language javascript
```

## Project Structure

```
src/
├── types/          # Zod schemas & TypeScript types
│   └── index.ts
├── utils/          # Helpers and prompt templates
│   ├── prompts.ts
│   ├── formatting.ts
│   ├── sandbox.ts
│   └── index.ts
├── executor/       # Code execution for different languages
│   ├── BaseExecutor.ts
│   ├── BunExecutor.ts
│   ├── PythonExecutor.ts
│   ├── TestRunner.ts
│   └── index.ts
├── generator/      # AI-powered generation pipeline
│   ├── problemGenerator.ts
│   ├── solutionGenerator.ts
│   ├── testCaseGenerator.ts
│   ├── testCodeGenerator.ts
│   └── index.ts
└── cli/            # CLI interface
    ├── generate.ts
    ├── solve.ts
    └── index.ts
```

## Architecture

### Generation Pipeline

1. **Problem Generation**: AI generates a problem description with constraints and examples
2. **Solution Generation**: AI creates an optimal solution with complexity analysis
3. **Test Case Generation**: AI generates natural language descriptions of test cases
4. **Test Code Generation**: AI converts descriptions to executable code that produces test inputs
5. **Test Execution**: Run the generated code to get actual inputs and expected outputs

### Executor Pattern

Abstract `BaseExecutor` class with language-specific implementations:

- `BunExecutor`: Runs JavaScript/TypeScript using Bun runtime
- `PythonExecutor`: Runs Python using subprocess

This makes it easy to add support for more languages (Java, Go, etc.)

### Type Safety

All data structures are validated using Zod schemas, ensuring type safety at runtime and compile time.

## Extending the System

### Adding a Web UI

The core functionality is in the `src/generator` and `src/executor` modules. To add a web UI:

1. Create API routes that call `generateCompleteProblem()` and `TestRunner.runTestCases()`
2. Use frameworks like Next.js, Express, or Hono
3. Import and use the existing modules - no refactoring needed!

Example Next.js API route:

```typescript
// app/api/generate/route.ts
import { generateCompleteProblem } from '@/src/generator';

export async function POST(request: Request) {
  const { difficulty, language } = await request.json();
  const problem = await generateCompleteProblem('anthropic/claude-haiku-4.5', difficulty, language);
  return Response.json(problem);
}
```

### Adding New Languages

1. Create a new executor class extending `BaseExecutor`
2. Implement `execute()`, `getFileExtension()`, and `validateRuntime()`
3. Add the language to `createExecutor()` factory in `src/executor/index.ts`
4. Update the `Language` enum in `src/types/index.ts`

## Development

The project uses:

- **Bun**: Runtime and package manager
- **TypeScript**: Type safety
- **Zod**: Runtime validation
- **Vercel AI SDK**: LLM integration with model string format

## License

MIT
