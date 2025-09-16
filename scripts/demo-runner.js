#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

const SCRIPTS_DIR = path.join(__dirname, '../src/scripts');

function getDemoFiles() {
  try {
    const files = fs.readdirSync(SCRIPTS_DIR)
      .filter(file => file.endsWith('.ts'))
      .sort();
    return files;
  } catch (error) {
    console.error('❌ Error reading scripts directory:', error.message);
    process.exit(1);
  }
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function displayMenu(files) {
  console.log('\n🚀 AI-Share Demo Runner\n');
  console.log('Available demos:');
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.replace('.ts', '')}`);
  });
  console.log('  0. Exit\n');
}

function promptUser(rl, files) {
  return new Promise((resolve) => {
    rl.question('Select a demo to run (number): ', (answer) => {
      const choice = parseInt(answer.trim());

      if (choice === 0) {
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);
      }

      if (choice >= 1 && choice <= files.length) {
        resolve(files[choice - 1]);
      } else {
        console.log('❌ Invalid choice. Please try again.');
        resolve(promptUser(rl, files));
      }
    });
  });
}

function runScript(scriptFile) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptFile);

  console.log(`\n🏃 Running: ${scriptFile}\n`);
  console.log('─'.repeat(50));

  const child = spawn('bun', ['run', scriptPath], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  child.on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.error('❌ bun is not installed or not in PATH. Please install bun first.');
      console.error('   Visit: https://bun.sh/docs/installation');
    } else {
      console.error('❌ Error running script:', error.message);
    }
    process.exit(1);
  });

  child.on('close', (code) => {
    console.log('\n' + '─'.repeat(50));
    if (code === 0) {
      console.log('✅ Script completed successfully');
    } else {
      console.log(`❌ Script exited with code ${code}`);
    }

    // Ask if user wants to run another demo
    const rl = createInterface();
    rl.question('\nRun another demo? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.close();
        main();
      } else {
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);
      }
    });
  });
}

async function main() {
  const files = getDemoFiles();

  if (files.length === 0) {
    console.log('❌ No demo files found in src/scripts directory');
    process.exit(1);
  }

  const rl = createInterface();

  displayMenu(files);
  const selectedFile = await promptUser(rl, files);
  rl.close();

  runScript(selectedFile);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  process.exit(0);
});

main().catch(console.error);