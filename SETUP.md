# One-time setup

You do these steps once. After that the app is a normal link.

## 1. Make the Google Sheet (backend)

Use the Google account that owns this business data. Do not use the DOH TRC account.

1. Go to sheets.google.com and create a blank sheet. Name it `Abogado Puhon Inventory Data`.
2. Open **Extensions > Apps Script**.
3. Delete the code that is there. Open `Code.gs` from this repository, copy everything, and paste it in.
4. Near the top, change `CHANGE-THIS-CODE` to a store code only you and Pola know (for example a word and a number). Click the save icon.
5. Click **Deploy > New deployment**. Click the gear, choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**. Allow the permissions when Google asks. Copy the **Web app URL** (it ends in `/exec`).

The Sheet fills itself with four tabs: Settings, Products, Moves and Photos. Column D on each tab is a readable summary. Do not edit column C by hand.

If you change `Code.gs` later, use **Deploy > Manage deployments > Edit > New version**. The link stays the same.

### If Google shows "Sorry, unable to open the file" (or the page opens with /u/1/ in the address)

This happens when more than one Google account is signed in in the same browser, and Google opens the wrong one. Fix it by using a private window:

1. Open a private (incognito) window and go to sheets.google.com.
2. Sign in with only the one account that owns the Sheet.
3. Open the Sheet and do Extensions > Apps Script from there.

Another way: go to script.google.com > New project, paste `Code.gs`, and also paste the Sheet's ID into `SHEET_ID` at the top.

## 2. Put the link in the app

1. In this repository, open `config.js` and click the pencil.
2. Paste the Web app URL between the quotes after `API_URL:`.
3. Commit the change.

## 3. Turn on GitHub Pages

1. In the repository, go to **Settings > Pages**.
2. Under Build and deployment choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and Save.
3. After a minute the app is at `https://pais8.github.io/abogado-puhon-inventory/`.

## 4. First time opening it

1. Open the link on Pola's phone. Type the store code.
2. Tap **Restore from a backup file** and pick `abogado-puhon-starting-data.json` (kept in your project files, not in GitHub). This loads the price list, the Nov 14 stock count and the 15 earlier orders. Or tap Start for the price list only.
3. On iPhone: Share > **Add to Home Screen**. On Android: menu > **Install app**.
4. On the laptop, open the same link and type the same store code.

## Safety notes

- Anyone with the app link and the store code can see and change the data. Keep the code private. To change it, edit `STORE_CODE` in the Apps Script and make a new version. Devices will ask for the new code.
- Settings > Backup downloads a full backup file. Do this once a week.
