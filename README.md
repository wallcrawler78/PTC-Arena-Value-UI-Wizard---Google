# PTC Arena Value Assessment Wizard

A Google Apps Script wizard UI that guides users through filling in the yellow input cells of the Arena ROI/Value calculator spreadsheet. The wizard writes to three tabs: **Data Input**, **Benefits Calc**, and **Legacy TCO**.

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (for `clasp`)
- Google Account with access to the target spreadsheet
- [clasp](https://github.com/google/clasp) CLI: `npm install -g @google/clasp`

### Setup

1. **Clone this repo**
   ```
   git clone <repo-url>
   cd PTC-Arena-Value-UI-Wizard---Google
   ```

2. **Log in with clasp**
   ```
   clasp login
   ```

3. **Create or link a GAS project**

   _If creating new:_
   ```
   clasp create --type sheets --title "Arena Value Wizard" --rootDir .
   ```
   This updates `.clasp.json` with the real `scriptId`.

   _If linking to an existing script:_
   Update `.clasp.json` with your `scriptId` from **Extensions > Apps Script > Project Settings**.

4. **Push files to GAS**
   ```
   clasp push
   ```

5. **Open the spreadsheet** and reload the page. You should see the **Arena Value Wizard** menu.

### Usage

| Action | How |
|--------|-----|
| Launch Wizard | Menu: Arena Value Wizard > Launch Wizard |
| Clear All Inputs | Menu: Arena Value Wizard > Clear All Inputs |
| Help / How It Works | Menu: Arena Value Wizard > Help / How It Works |

### Wizard Steps

| Step | Title | Writes To | What to Enter |
|------|-------|-----------|--------------|
| 1 | Company Profile | Data Input | Customer name, revenue, headcount |
| 2 | Business Assumptions | Data Input | Growth rate, new product %, margins, NPD cycle |
| 3 | Cost Structure | Data Input | COGS %, materials, inventory, recovery costs |
| 4 | Team Resources | Data Input | FTE counts and salaries for 7 roles |
| 5 | Revenue & COGS Benefits | Benefits Calc | TTM improvement, material and inventory savings |
| 6 | Productivity Benefits | Benefits Calc | Team efficiency sliders |
| 7 | Cost Recovery Benefits | Benefits Calc | Cost reduction sliders |
| 8 | Legacy System Costs | Legacy TCO | Current PLM/system costs for TCO comparison |
| 9 | Review & Submit | (all tabs) | Confirm and write to spreadsheet |

## File Structure

```
/
├── appsscript.json    GAS manifest (V8 runtime, Sheets + UI scopes)
├── Code.gs            Server-side: menu, dialog, read/write, validate
├── Config.gs          All cell mappings and field definitions (single source of truth)
├── SheetAudit.gs      Diagnostic: verifies wizard→sheet cell alignment
├── Wizard.html        HTML shell — injects server config, includes partials
├── Help.html          In-app help guide (tabbed, modeless dialog 760×580)
├── _styles.html       CSS (Arena brand colors, slider styles, step indicator)
├── _script.html       JavaScript (wizard state machine, GAS bridge)
├── .clasp.json        clasp deployment config (update scriptId)
├── README.md          This file
└── Docs/
    ├── SETUP.md             Detailed clasp/GAS setup
    ├── SHEET_CONFIG.md      Cell mapping reference (verified against Config.gs)
    ├── SHEETAUDIT_GUIDE.md  How to run the sheet audit diagnostic
    ├── UI_AUDIT.md          Config vs sheet structure audit results
    ├── CODE_REVIEW.md       Full code review and architecture documentation
    └── LEGACY_TCO_ANALYSIS.md  Planning doc (superseded — Legacy TCO is now implemented)
```

## Updating Cell References

If the spreadsheet structure changes, edit **`Config.gs`** — it is the single source of truth for all cell mappings. See `Docs/SHEET_CONFIG.md` for the field reference.

After changing Config.gs, run `runSheetAudit()` from the Apps Script editor to verify alignment. See `Docs/SHEETAUDIT_GUIDE.md`.

## Troubleshooting

- **Menu not appearing:** Reload the spreadsheet or run `onOpen()` manually from the Apps Script editor.
- **Dialog doesn't open:** Check browser popup blockers. The dialog runs in a sandboxed iframe.
- **Values not saving:** Verify the sheet tab names match `SPREADSHEET_TABS` in `Config.gs`.
- **Wrong values written:** Run `runSheetAudit()` in the Apps Script editor to check cell alignment.
