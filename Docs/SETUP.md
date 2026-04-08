# Setup Guide — Arena Value Wizard (GAS + clasp)

## Prerequisites

| Tool | Install |
|------|---------|
| Node.js 18+ | https://nodejs.org/ |
| clasp CLI | `npm install -g @google/clasp` |
| Google Account | Must have edit access to target spreadsheet |

---

## Step 1 — Authenticate clasp

```bash
clasp login
```

This opens a browser window to authorize clasp with your Google account. Credentials are stored in `~/.clasprc.json`.

---

## Step 2 — Link to the GAS project

### Option A: Use an existing Apps Script project

1. Open the target spreadsheet in Google Sheets.
2. Go to **Extensions > Apps Script**.
3. Click the gear icon (Project Settings) and copy the **Script ID**.
4. In `.clasp.json`, replace `YOUR_SCRIPT_ID_HERE` with the copied ID.

### Option B: Create a new container-bound script

```bash
clasp create --type sheets --title "Arena Value Wizard" --rootDir .
```

clasp will update `.clasp.json` automatically and prompt you to link to an existing spreadsheet or create a new one.

---

## Step 3 — Push code to GAS

```bash
clasp push
```

Pushes all `.gs` and `.html` files to Google Apps Script. To watch for changes and auto-push:

```bash
clasp push --watch
```

---

## Step 4 — Verify in the Spreadsheet

1. Open (or reload) the spreadsheet.
2. Go to **Extensions > Apps Script** and run `onOpen()` once to initialize the menu.
3. Return to the spreadsheet — you should see the **Arena Value Wizard** menu in the menu bar.
4. Click **Launch Wizard** and walk through all 9 steps.

---

## Step 5 — Authorize Scopes (first run only)

On first run, Google will show an authorization dialog:
- **"View and manage your spreadsheets"** — required to read/write cells.
- **"Display and run third-party web content"** — required for the HTML dialog.

Click **Allow**.

---

## Deployment Notes

- The script runs **entirely within the user's Google account** — no external servers.
- No API keys or secrets are required.
- `SpreadsheetApp.flush()` is called after all writes to force recalculation.
- To deploy a new version: `clasp push` and reload the spreadsheet.

---

## Useful clasp Commands

| Command | Description |
|---------|-------------|
| `clasp push` | Push local files to GAS |
| `clasp pull` | Pull GAS files to local |
| `clasp open` | Open the GAS editor in browser |
| `clasp logs` | Stream Stackdriver logs |
| `clasp status` | Show files to be pushed |
