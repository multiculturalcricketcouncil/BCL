import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const photosDir = path.join(root, "photos");
const dataDir = path.join(root, "data");

const imageExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const videoExt = new Set([".mp4", ".webm", ".mov", ".m4v"]);

function readFiles(dir, extSet) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => extSet.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

function withWebPath(folderName, fileName) {
  return `photos/${folderName}/${fileName}`;
}

const galleryFiles = readFiles(path.join(photosDir, "gallery"), imageExt);
const homepageImages = readFiles(path.join(photosDir, "homepage"), imageExt);
const homepageVideos = readFiles(path.join(photosDir, "homepage"), videoExt);

const galleryItems = galleryFiles.map((file) => ({
  src: withWebPath("gallery", file),
  title: path.basename(file, path.extname(file)).replace(/[-_]+/g, " "),
  caption: "Update caption in data/gallery.json if needed."
}));

const mediaIndex = {
  homepage: {
    images: homepageImages.map((file) => withWebPath("homepage", file)),
    videos: homepageVideos.map((file) => withWebPath("homepage", file))
  },
  gallery: {
    images: galleryFiles.map((file) => withWebPath("gallery", file))
  }
};

fs.writeFileSync(path.join(dataDir, "gallery.json"), JSON.stringify({ items: galleryItems }, null, 2));
fs.writeFileSync(path.join(dataDir, "media-index.json"), JSON.stringify(mediaIndex, null, 2));

console.log(`Generated data/gallery.json (${galleryItems.length} items)`);
console.log(`Generated data/media-index.json (homepage images: ${homepageImages.length}, videos: ${homepageVideos.length})`);
