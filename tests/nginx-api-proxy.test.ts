import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const nginxConfig = readFileSync('nginx.conf', 'utf8');
const composeConfig = readFileSync('../docker-compose.yml', 'utf8');

test('nginx proxies api traffic to backend with rate limit zones', () => {
  assert.match(nginxConfig, /limit_req_zone\s+\$binary_remote_addr\s+zone=api_general/);
  assert.match(nginxConfig, /limit_req_zone\s+\$binary_remote_addr\s+zone=api_auth/);
  assert.match(nginxConfig, /limit_req_zone\s+\$binary_remote_addr\s+zone=api_upload/);
  assert.match(nginxConfig, /location\s+\^~\s+\/api\/auth\//);
  assert.match(nginxConfig, /proxy_pass\s+http:\/\/backend_api/);
});

test('docker frontend calls api through nginx and backend is host-local only', () => {
  assert.match(composeConfig, /VITE_API_URL=\/api/);
  assert.match(composeConfig, /127\.0\.0\.1:3000:3000/);
});
