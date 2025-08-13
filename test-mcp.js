import { spawn } from 'child_process';

console.log('Testing MCP server startup...');

const child = spawn('npx', ['-y', '@mohanputti/financial-planner-mcp'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log('Process exited with code:', code);
  console.log('Full output:', output);
  console.log('Full error:', errorOutput);
});

child.on('error', (error) => {
  console.error('Failed to start process:', error);
});

// Send a simple MCP request after a delay
setTimeout(() => {
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  };
  
  child.stdin.write(JSON.stringify(request) + '\n');
}, 1000);

// Kill after 5 seconds
setTimeout(() => {
  console.log('Killing process...');
  child.kill('SIGTERM');
}, 5000);