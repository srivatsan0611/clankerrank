/**
 * Example: How to use the AI LeetCode Generator programmatically
 *
 * This demonstrates how to use the core modules directly in your code,
 * which is useful when building a web UI or API server.
 */

import { createTestRunner } from './src/executor/index.js';
import { generateCompleteProblem } from './src/generator/index.js';

import type { Language } from './src/types/index.js';

async function main() {
  // Configuration
  const model = 'google/gemini-2.0-flash'; // or "openai/gpt-4", etc.
  const language: Language = 'typescript';

  console.log('='.repeat(80));
  console.log('AI LeetCode Generator - Programmatic Example');
  console.log('='.repeat(80));

  // Step 1: Generate a complete problem
  console.log('\n📚 Generating a medium difficulty problem about arrays...\n');

  const problemPackage = await generateCompleteProblem(model, 'medium', language, {
    topic: 'arrays',
    numTestCases: 8,
    numSampleTestCases: 2,
  });

  console.log('\n✅ Problem generated successfully!');
  console.log(`\nTitle: ${problemPackage.problem.title}`);
  console.log(`Description: ${problemPackage.problem.description.substring(0, 100)}...`);
  console.log(`\nTest Cases:`);
  console.log(`  - Sample: ${problemPackage.sampleTestCases.length}`);
  console.log(`  - Hidden: ${problemPackage.hiddenTestCases.length}`);

  // Step 2: Create a simple (potentially incorrect) user solution for testing
  console.log('\n\n🧪 Testing with a sample user solution...\n');

  // Example: A simple solution that might work for some test cases
  const userSolution = `
function solution(arr) {
  // A naive solution - might not be optimal
  return arr.length > 0 ? arr[0] : null;
}
`;

  // Step 3: Run tests
  const testRunner = createTestRunner(language);

  console.log('Running sample test cases...');
  const sampleResults = await testRunner.runTestCases(userSolution, problemPackage.sampleTestCases);

  const samplePassed = sampleResults.filter((r) => r.passed).length;
  console.log(`  Sample Tests: ${samplePassed}/${sampleResults.length} passed`);

  console.log('\nRunning hidden test cases...');
  const hiddenResults = await testRunner.runTestCases(userSolution, problemPackage.hiddenTestCases);

  const hiddenPassed = hiddenResults.filter((r) => r.passed).length;
  console.log(`  Hidden Tests: ${hiddenPassed}/${hiddenResults.length} passed`);

  // Step 4: Show results
  const totalPassed = samplePassed + hiddenPassed;
  const totalTests = sampleResults.length + hiddenResults.length;

  console.log('\n' + '='.repeat(80));
  console.log(`FINAL RESULT: ${totalPassed}/${totalTests} tests passed`);
  console.log('='.repeat(80));

  // This demonstrates the full workflow:
  // 1. Generate problem with AI
  // 2. Get test cases automatically
  // 3. Test user solutions
  // 4. Validate results
  //
  // You can now use these same functions in a web API!
}

// Run the example
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
