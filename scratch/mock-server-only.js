// Load .env.local environment variables manually first
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const parts = trimmed.split('=');
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.error('Failed to load .env.local in mock-server-only:', e);
}

// Mock server-only package so CLI scripts can run
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'server-only') {
    return {};
  }
  return originalRequire.apply(this, arguments);
};
