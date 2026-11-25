# BluePilot Flasher

A fork of [commaai/flash](https://github.com/commaai/flash) that lets you choose **which AGNOS version** to flash onto a comma device, so a BluePilot release can be installed on the AGNOS it was built for. Hosted at <https://BluePilotDev.github.io/flash/>. Uses [qdl.js](https://github.com/commaai/qdl.js). Not affiliated with comma.ai.

## How versions work

- [src/versions.js](src/versions.js) is the hand-edited list: AGNOS version, the BluePilot release it belongs to (shown as the subtitle), and which devices it supports. Exactly one entry is `default`.
- Each entry has its manifests in `public/manifests/<id>/` (`all-partitions.json` + `agnos.json`; `agnos.json` overrides matching images, same as upstream).
- Image archives are still downloaded from comma's CDN. `scripts/mirror-images.mjs` downloads them all into the gitignored `mirror/` folder, so they can be hosted ourselves later (rewrite the URLs in the manifests).
- If the chosen version has no manifest for the connected device, the flasher stops with an error instead of falling back to another version.

### Adding a new BluePilot release

1. Copy that branch's `all-partitions.json` and `agnos.json` into `public/manifests/bp-x.y/`.
2. Add an entry at the top of `VERSIONS` (set `devices`, move `default` if needed).
3. `bun run validate` (HEADs every image URL and lists which bootloader images differ from the newest entry), then `bun run test`.

Before offering any entry, check the bootloader diff printed by `validate`. Flashing older bootloaders is the risky part.

## Development

```bash
bun install
bun dev
```

* `?fast=1` skips flashing the system partition (the slowest). `?windows=1` forces Windows mode.
* `bun run validate` checks the manifests and image URLs. `MANIFEST_BRANCH=bp-7.1 bun run test` also downloads every image of that version.
* No analytics or error reporting is sent anywhere (upstream's PostHog/Sentry/Plausible were removed).
