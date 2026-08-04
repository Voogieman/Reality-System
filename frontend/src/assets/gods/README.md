# God Images Folder

Put god background images in this folder.

Naming rule:
- file name can match either:
  - god `id` from the pantheon (`veles.png`, `perun.jpg`, `mokosh.webp`)
  - or Russian god name (`велес.png`, `перун.jpg`, `мокошь.webp`)

Supported extensions:
- `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`

How it works:
- when user selects a god, UI looks for `<godId>.<ext>` in this folder;
- if no file is found, fallback image `/veles-bg.png` is used.

