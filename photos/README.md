# Photos folder

- Put gallery images in `photos/gallery/`
- Put homepage images/videos in `photos/homepage/`
- Put team logos in `photos/teams/`

Then run:

```bash
npm run build:media
```

This regenerates:
- `data/gallery.json` from all files in `photos/gallery/`
- `data/media-index.json` from files in `photos/homepage/` and `photos/gallery/`
