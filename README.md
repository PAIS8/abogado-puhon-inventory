# Abogado Puhon Inventory

A phone-first inventory and selling app for the Abogado Puhon magnetic bookmarks.

- Sell by design, size (Standard or Mini) and finish (Glossy or Glittery), with the mix-and-match discount
- Utang with partial payments, pre-orders, stickers with their own price
- Stock per design, size and finish, low-stock warnings, stock count fixes
- Reports: sales, profit, best sellers, Excel (CSV) download
- Works on a phone and a laptop. Data is shared through a Google Sheet.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app |
| `config.js` | Holds the link to the Google Sheet backend |
| `Code.gs` | The Google Apps Script backend. It is pasted into the Sheet, it does not run from here |
| `photos/` | Design pictures |
| `sw.js`, `manifest.webmanifest`, icons | Lets the app open fast and be added to the home screen |

This repository holds only code, the price list and design pictures. Customer names, orders and stock live in the Google Sheet.

See `SETUP.md` for the one-time setup.
