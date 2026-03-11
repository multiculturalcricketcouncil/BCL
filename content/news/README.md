# News CMS folder

Create one JSON file per news item in this folder. Example fields:

```json
{
  "slug": "your-news-slug",
  "title": "Your news title",
  "date": "2025-04-01",
  "author": "BCL Media",
  "coverImage": "photos/gallery/your-image.jpg",
  "excerpt": "Short card summary",
  "body": [
    { "type": "paragraph", "text": "Paragraph text" },
    { "type": "list", "items": ["Point one", "Point two"] }
  ]
}
```

After adding or editing items, run:

```bash
node scripts/generate-news-index.mjs
```

This rebuilds `content/news/index.json` for the News page.
