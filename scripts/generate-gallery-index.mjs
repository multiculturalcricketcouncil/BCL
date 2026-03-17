import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const galleryConfigPath = path.join(root, "data", "gallery.json");
const imageExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const config = fs.existsSync(galleryConfigPath)
  ? JSON.parse(fs.readFileSync(galleryConfigPath, "utf8"))
  : {};

const folder = String(config.folder || "photos/gallery").replace(/^\/+|\/+$/g, "");
const galleryDir = path.join(root, folder);
const outFile = path.join(galleryDir, "index.json");

if (!fs.existsSync(galleryDir)) {
  throw new Error(`Gallery folder not found: ${galleryDir}`);
}

const items = fs
  .readdirSync(galleryDir)
  .filter((file) => imageExt.has(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b))
  .map((file) => ({
    src: `${folder}/${file}`,
    title: path.basename(file, path.extname(file)).replace(/[-_]+/g, " "),
    caption: ""
  }));

fs.writeFileSync(galleryConfigPath, JSON.stringify({ folder }, null, 2));
fs.writeFileSync(outFile, JSON.stringify({ items }, null, 2));
console.log(`Generated ${outFile} with ${items.length} items from ${folder}.`);
