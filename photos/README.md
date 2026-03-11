# Photos folder

- Put gallery images in `photos/gallery/`
- Put player images in `photos/players/2025/`
- Name player images using the shirt number, for example:
  - `1.jpg`
  - `6.png`
  - `16.webp`

Then run:

```bash
node scripts/generate-gallery-index.mjs
```

and commit the updated `data/gallery.json`.
