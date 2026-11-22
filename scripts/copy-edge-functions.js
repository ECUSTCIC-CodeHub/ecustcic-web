// scripts/copy-edge-functions.js
// 构建后处理：将 edge-functions/ 与 cloud-functions/ 复制到 dist/
// 使 `edgeone pages deploy ./dist` 部署时能同时带上两类 Functions
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

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

if (!copied) {
  console.log('No functions directories found, skipping.');
} else {
  // 重写 dist/package.json 为极简版，只保留平台安装依赖所需的 dependencies。
  // 若把项目根完整 package.json 带进 dist（含 scripts.build 等），
  // 平台在部署 ./dist 时会尝试执行其中的构建脚本（webpack4 在平台环境失败），
  // 导致整个部署 Process 阶段报 Failed。
  const minimal = {
    dependencies: {
      '@edgeone/pages-blob':
        (pkg.dependencies && pkg.dependencies['@edgeone/pages-blob']) || '^0.0.19',
    },
  };
  fs.writeFileSync(
    path.join(root, 'dist', 'package.json'),
    JSON.stringify(minimal, null, 2)
  );
  console.log('Rewrote dist/package.json to minimal dependencies-only form.');
}
