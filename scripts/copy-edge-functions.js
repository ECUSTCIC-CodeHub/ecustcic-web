// scripts/copy-edge-functions.js
// 构建后处理：将 edge-functions/ 复制到 dist/edge-functions/
// 使 `edgeone pages deploy ./dist` 部署时能同时带上 Edge Functions
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'edge-functions');
const dest = path.resolve(__dirname, '..', 'dist', 'edge-functions');

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (fs.existsSync(src)) {
  copyDir(src, dest);
  console.log('Copied edge-functions/ to dist/edge-functions/');
} else {
  console.log('No edge-functions/ directory found, skipping.');
}
