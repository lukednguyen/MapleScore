# MapleScore

Adds an NCLC column to TCF Canada result tables, for Firefox and Chrome.

## Build

```sh
git clone https://github.com/lukednguyen/MapleScore.git
cd MapleScore
npm test
npm run build
```

## Try locally

Firefox: open `about:debugging#/runtime/this-firefox`, click Load Temporary Add-on, pick `dist/firefox/manifest.json`.

Chrome: open `chrome://extensions`, turn on Developer mode, click Load unpacked, pick `dist/chrome`.

## Release

```sh
npm version patch
git push --follow-tags
```

The tag push attaches both zips to a GitHub Release.

## Publish to Firefox

Upload `dist/maplescore-firefox-<version>.zip` at https://addons.mozilla.org/developers/ (listed or unlisted).

Or sign unlisted from the CLI with keys from https://addons.mozilla.org/developers/addon/api/key/:

```sh
WEB_EXT_API_KEY=<jwt-issuer> WEB_EXT_API_SECRET=<jwt-secret> npm run sign:firefox
```

## Publish to Chrome

Upload `dist/maplescore-chrome-<version>.zip` at https://chrome.google.com/webstore/devconsole ($5 one-time developer fee).

Listing text: `store/listing.md`.

## License

Mozilla Public License 2.0. See `LICENSE`.
