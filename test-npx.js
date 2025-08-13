import { spawn } from 'child_process';

const child = spawn('npx', ['-y', '@mohanputti/financial-planner-mcp@1.0.4'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

child.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log('Exit code:', code);
});

child.on('error', (error) => {
  console.error('Error:', error);
});

setTimeout(() => {
  console.log('Killing process...');
  child.kill('SIGTERM');
}, 3000);