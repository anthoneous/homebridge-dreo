#!/usr/bin/env node

// Test Runner for Dreo HM311S Homebridge Plugin
console.log('🧪 Dreo HM311S Homebridge Plugin Test Suite');
console.log('==========================================');
console.log('');

const { spawn } = require('child_process');
const path = require('path');

// Test configurations
const tests = [
  {
    name: 'Humidity Fix Test',
    description: 'Tests humidity range clamping and validation for HM311S (fixes 90% bug)',
    file: 'test-humidity-fix.js',
    isShell: false,
  },
  {
    name: 'HomeKit Display Test',
    description: 'Tests HomeKit characteristic display mapping (0-100% range)',
    file: 'test-homekit-display.js',
    isShell: false,
  },
  {
    name: 'Humidifier Display Test',
    description: 'Tests service name display in HomeKit (Humidifier vs Humidifier-Dehumidifier)',
    file: 'test-humidifier-display.js',
    isShell: false,
  },
  {
    name: 'Model Display Test',
    description: 'Tests model name display (DR-HM311S vs DR-HHM001S)',
    file: 'test-model-display.sh',
    isShell: true,
  },
];

// Function to run a single test
function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`🔬 Running: ${test.name}`);
    console.log(`📝 Description: ${test.description}`);
    console.log(`📄 File: ${test.file}`);
    console.log('─'.repeat(50));

    const testPath = path.join(__dirname, test.file);
    const command = test.isShell ? 'bash' : 'node';

    const child = spawn(command, [testPath], {
      stdio: 'inherit',
      cwd: __dirname,
    });

    child.on('close', (code) => {
      console.log('─'.repeat(50));
      if (code === 0) {
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        console.log(`❌ ${test.name} - FAILED (exit code: ${code})`);
      }
      console.log('');
      resolve(code === 0);
    });

    child.on('error', (error) => {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      console.log('');
      reject(error);
    });
  });
}

// Function to run all tests
async function runAllTests() {
  const results = [];

  console.log('🚀 Starting test suite execution...');
  console.log('');

  for (const test of tests) {
    try {
      const passed = await runTest(test);
      results.push({ name: test.name, passed });
    } catch (error) {
      results.push({ name: test.name, passed: false, error });
    }
  }

  // Display summary
  console.log('📊 Test Suite Summary');
  console.log('====================');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
  });

  console.log('');
  console.log(`📈 Results: ${passed}/${total} tests passed (${Math.round(passed/total * 100)}%)`);

  if (failed === 0) {
    console.log('🎉 All tests passed! The Dreo HM311S plugin is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }

  console.log('');
  console.log('🔧 Test Coverage:');
  console.log('================');
  console.log('✅ Humidity validation (30-90% range, edge cases)');
  console.log('✅ HomeKit display accuracy (percentage mapping)');
  console.log('✅ Service type display (humidifier-only)');
  console.log('✅ Model name display (DR-HM311S vs DR-HHM001S)');

  return failed === 0;
}

// Run individual test if specified, otherwise run all
const testArg = process.argv[2];
if (testArg) {
  const specificTest = tests.find(t =>
    t.file === testArg ||
    t.name.toLowerCase().includes(testArg.toLowerCase()) ||
    t.file.includes(testArg),
  );

  if (specificTest) {
    console.log(`🎯 Running specific test: ${specificTest.name}`);
    console.log('');
    runTest(specificTest).then(passed => {
      process.exit(passed ? 0 : 1);
    });
  } else {
    console.log(`❌ Test not found: ${testArg}`);
    console.log('');
    console.log('Available tests:');
    tests.forEach(test => {
      console.log(`  - ${test.file} (${test.name})`);
    });
    process.exit(1);
  }
} else {
  runAllTests().then(allPassed => {
    process.exit(allPassed ? 0 : 1);
  });
}
