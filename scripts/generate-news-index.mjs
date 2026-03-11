import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const newsDir = path.join(root, "content", "news");
const outFile = path.join(newsDir, "index.json");

const entries = fs
  .readdirSync(newsDir)
  .filter((file) => file.endsWith(".json") && file !== "index.json")
  .map((file) => {
    const fullPath = path.join(newsDir, file);
    const item = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    return {
      slug: item.slug,
      title: item.title,
      date: item.date,
      author: item.author ?? "BCL Media",
      coverImage: item.coverImage ?? "",
      excerpt: item.excerpt ?? ""
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outFile, JSON.stringify(entries, null, 2));
console.log(`Generated ${outFile} with ${entries.length} items.`);
