// scripts/copy-edge-functions.js
// 构建后处理：将 edge-functions/ 与 cloud-functions/ 复制到 dist/
// 使 `edgeone pages deploy ./dist` 部署时能同时带上两类 Functions
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

let copied = false;

// Edge Functions（V8 运行时，KV 访问）
const edgeSrc = path.join(root, 'edge-functions');
const edgeDest = path.join(root, 'dist', 'edge-functions');
if (fs.existsSync(edgeSrc)) {
  copyDir(edgeSrc, edgeDest);
  console.log('Copied edge-functions/ to dist/edge-functions/');
  copied = true;
}

// Cloud Functions（Node.js / Go / Python 运行时，npm 依赖、Blob SDK）
const cloudSrc = path.join(root, 'cloud-functions');
const cloudDest = path.join(root, 'dist', 'cloud-functions');
if (fs.existsSync(cloudSrc)) {
  copyDir(cloudSrc, cloudDest);
  console.log('Copied cloud-functions/ to dist/cloud-functions/');
  copied = true;
}

if (!copied) console.log('No functions directories found, skipping.');
