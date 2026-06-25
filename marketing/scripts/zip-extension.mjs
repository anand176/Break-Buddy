import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const marketingRoot = path.resolve(__dirname, '..');
const extensionDir = path.resolve(marketingRoot, '../extension');
const publicDir = path.join(marketingRoot, 'public');
const zipPath = path.join(publicDir, 'break-buddy-extension.zip');

if (!existsSync(extensionDir)) {
  console.error('Extension folder not found:', extensionDir);
  process.exit(1);
}

mkdirSync(publicDir, { recursive: true });
if (existsSync(zipPath)) rmSync(zipPath);

const isWindows = process.platform === 'win32';

if (isWindows) {
  const psExtension = extensionDir.replace(/'/g, "''");
  const psZip = zipPath.replace(/'/g, "''");
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${psExtension}\\*' -DestinationPath '${psZip}' -Force"`,
    { stdio: 'inherit' },
  );
} else {
  execSync(`cd "${extensionDir}" && zip -r "${zipPath}" . -x "*.DS_Store"`, {
    stdio: 'inherit',
  });
}

console.log('Created', zipPath);
