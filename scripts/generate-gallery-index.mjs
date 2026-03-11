import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const galleryDir = path.join(root, "photos", "gallery");
const outFile = path.join(root, "data", "gallery.json");
const imageExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const items = fs
  .readdirSync(galleryDir)
  .filter((file) => imageExt.has(path.extname(file).toLowerCase()))
  .sort()
  .map((file) => ({
    src: `photos/gallery/${file}`,
    title: path.basename(file, path.extname(file)).replace(/[-_]+/g, " "),
    caption: "Update caption in data/gallery.json if needed."
  }));

fs.writeFileSync(outFile, JSON.stringify({ items }, null, 2));
console.log(`Generated ${outFile} with ${items.length} items.`);
