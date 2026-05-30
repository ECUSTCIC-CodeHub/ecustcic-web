/**
 * VuePress 1.x 构建后处理脚本
 * 
 * VuePress 默认生成两种链接格式（目录式 /foo/ 和文件式 /foo.html），
 * 但只生成目录式的 index.html 文件。这导致 /foo.html 的请求返回 404。
 * 
 * 此脚本：
 * 1. 为每个 subdir/index.html 创建对应的 subdir.html 副本
 * 2. 将所有 HTML 文件中"返回主站"的 href="/tech/" 替换为 href="/"
 * 3. 将构建产物同步到 public/tech/
 */

const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist', 'tech');
const publicDir = path.resolve(__dirname, '..', 'public', 'tech');

// Step 1: 为目录式 index.html 创建 .html 副本
function createHtmlAliases(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(dir, entry.name);
      const indexPath = path.join(subDir, 'index.html');
      const aliasPath = path.join(dir, `${entry.name}.html`);
      
      if (fs.existsSync(indexPath) && !fs.existsSync(aliasPath)) {
        fs.copyFileSync(indexPath, aliasPath);
        console.log(`Created: ${path.relative(distDir, aliasPath)}`);
      }
      
      // 递归处理子目录
      createHtmlAliases(subDir);
    }
  }
}

// Step 2: 修复"返回主站"链接
function fixHomeLinks(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixHomeLinks(fullPath);
    } else if (entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      // 替换"返回主站"对应的 href="/tech/" 为 href="/"
      const newContent = content.replace(
        /href="\/tech\/"(>[^<]*返回主站)/g,
        'href="/"$1'
      );
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf-8');
        console.log(`Fixed home link: ${path.relative(distDir, fullPath)}`);
      }
    }
  }
}

// Step 3: 同步到 public/tech/
function syncToPublic() {
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  copyDir(distDir, publicDir);
  console.log(`Synced to public/tech/`);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 执行
console.log('=== VuePress docs post-build ===');
createHtmlAliases(distDir);
fixHomeLinks(distDir);
syncToPublic();
console.log('=== Done ===');
