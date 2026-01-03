import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesDir = path.join(__dirname, '../resources');

// シンプルなSVGアイコンデータ（緑の背景に「群」）
const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a1a"/>
  <rect x="112" y="112" width="800" height="800" rx="100" fill="#39ff14"/>
  <text x="50%" y="55%" font-family="monospace" font-size="600" fill="#1a1a1a" text-anchor="middle" dominant-baseline="middle" font-weight="bold">群</text>
</svg>
`;

// シンプルなSVGスプラッシュデータ
const splashSvg = `
<svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a1a"/>
  <text x="50%" y="50%" font-family="monospace" font-size="200" fill="#39ff14" text-anchor="middle" dominant-baseline="middle">おまえはグンマーから\nにげられない</text>
</svg>
`;

if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir);
    console.log('Created resources directory');
}

// SVGファイルとして保存 (Capacitor Assetsはソースとして画像ファイルを期待するため)
// 本来は高解像度PNGが望ましいですが、一旦プレースホルダーとしてSVGを保存し、
// 必要であれば手動でPNG変換やスクリーンショットを利用してください。
fs.writeFileSync(path.join(resourcesDir, 'icon.svg'), iconSvg.trim());
fs.writeFileSync(path.join(resourcesDir, 'splash.svg'), splashSvg.trim());

console.log('Generated placeholder assets in /resources');
console.log('Run: npx capacitor-assets generate --ios --icon resources/icon.svg --splash resources/splash.svg');
