/**
 * Code.gs
 * Server-side entry points for the Arena Value Assessment Wizard.
 *
 * Functions:
 *   onOpen()           - Adds the Arena Value Wizard menu to the Sheets UI
 *   showWizard()       - Opens the wizard modal dialog
 *   include(filename)  - HTML template helper for partials (_styles, _script)
 *   getCurrentValues() - Reads all yellow input cells and returns current state
 *   saveWizardData()   - Validates and writes wizard form data to both tabs
 *   clearAllInputs()   - Prompts user and clears all yellow input cells
 *   getWizardConfig()  - Exposed for HTML template injection (defined in Config.gs)
 */

// ─── Menu ────────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Arena Value Wizard')
    .addItem('Launch Wizard', 'showWizard')
    .addSeparator()
    .addItem('Clear All Inputs', 'clearAllInputs')
    .addSeparator()
    .addItem('Help / How It Works', 'showHelp')
    .addToUi();
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

function showHelp() {
  var html = HtmlService.createHtmlOutputFromFile('Help')
    .setWidth(760)
    .setHeight(580)
    .setTitle('Arena Value Wizard — Help & Guide');
  SpreadsheetApp.getUi().showModelessDialog(html, 'Arena Value Wizard — Help & Guide');
}

function showWizard() {
  var template = HtmlService.createTemplateFromFile('Wizard');
  var html = template.evaluate()
    .setWidth(920)
    .setHeight(700)
    .setTitle('Arena Value Assessment Wizard');
  SpreadsheetApp.getUi().showModalDialog(html, 'Arena Value Assessment Wizard');
}

/**
 * HTML template include helper.
 * Usage in .html files: <?!= include('_styles'); ?>
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─── Data Read ───────────────────────────────────────────────────────────────

/**
 * Reads current values from both tabs and returns a flat object keyed by field id.
 * Called by the wizard on load to pre-populate fields.
 *
 * @return {Object} { fieldId: rawValue, ... }
 */
function getCurrentValues() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var config = getSheetConfig();
  var result = {};

  // Read Data Input tab
  var diSheet = ss.getSheetByName(config.tabs.DATA_INPUT);
  if (diSheet) {
    config.dataInput.fields.forEach(function(field) {
      var cell = diSheet.getRange(config.dataInput.writeCol + field.row);
      var raw = cell.getValue();
      result[field.id] = convertFromSheet(raw, field.storeAs);
    });
  }

  // Read Benefits Calc tab
  var bcSheet = ss.getSheetByName(config.tabs.BENEFITS_CALC);
  if (bcSheet) {
    config.benefitsCalc.fields.forEach(function(field) {
      var impCell = bcSheet.getRange(config.benefitsCalc.improvementCol + field.row);
      var incCell = bcSheet.getRange(config.benefitsCalc.includeCol + field.row);
      var rawImp = impCell.getValue();
      var rawInc = incCell.getValue();

      result[field.id] = convertFromSheet(rawImp, field.storeAs);
      result[field.id + '_include'] = (rawInc === '' || rawInc === null)
        ? field.defaultInclude
        : (rawInc === 'Yes' || rawInc === true);
    });
  }

  // Read Legacy TCO tab
  var tcoSheet = ss.getSheetByName(config.tabs.LEGACY_TCO);
  if (tcoSheet) {
    // On-prem / perpetual license toggle (E3)
    var rawOnPrem = tcoSheet.getRange(config.legacyTco.onPremCell).getValue();
    result['legacyOnPrem'] = (rawOnPrem === '' || rawOnPrem === null) ? 'Yes' : String(rawOnPrem);

    config.legacyTco.rows.forEach(function(row) {
      var rawUnitCost = tcoSheet.getRange(config.legacyTco.unitCostCol + row.row).getValue();
      var rawQty      = tcoSheet.getRange(config.legacyTco.qtyCol      + row.row).getValue();
      var rawInclude  = tcoSheet.getRange(config.legacyTco.includeCol  + row.row).getValue();

      result[row.id + '_unitCost'] = convertFromSheet(rawUnitCost, 'currency');
      result[row.id + '_qty']      = convertFromSheet(rawQty, row.qtyStoreAs);
      result[row.id + '_include']  = (rawInclude === '' || rawInclude === null)
        ? row.defaultInclude
        : (rawInclude === 'Yes' || rawInclude === true);
    });
  }

  return result;
}

/**
 * Converts a raw sheet value back to wizard display units.
 * 'decimal' cells store 0.10 → wizard shows 10 (percent)
 */
function convertFromSheet(raw, storeAs) {
  if (raw === '' || raw === null || raw === undefined) return null;
  // Treat "Mandatory" template placeholders in the sheet as empty
  if (typeof raw === 'string' && raw.trim().toLowerCase() === 'mandatory') return null;
  if (storeAs === 'decimal') {
    // Sheet stores as decimal (0.10), wizard works in percent (10)
    return Math.round(parseFloat(raw) * 100 * 100) / 100; // two decimal places
  }
  return raw;
}

// ─── Data Write ──────────────────────────────────────────────────────────────

/**
 * Validates and saves wizard form data to both tabs atomically.
 * Called by the wizard submit button.
 *
 * @param {Object} formData - Flat object { fieldId: value, fieldId_include: bool }
 * @return {Object} { success: bool, errors: string[] }
 */
function saveWizardData(formData) {
  try {
    // Validate first
    var errors = validateFormData(formData);
    if (errors.length > 0) {
      return { success: false, errors: errors };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var config = getSheetConfig();

    // Verify all tabs exist BEFORE writing anything (ensures atomic behaviour)
    var diSheet = ss.getSheetByName(config.tabs.DATA_INPUT);
    if (!diSheet) {
      return { success: false, errors: ['Could not find "Data Input" tab. Check tab name in Config.gs.'] };
    }
    var bcSheet = ss.getSheetByName(config.tabs.BENEFITS_CALC);
    if (!bcSheet) {
      return { success: false, errors: ['Could not find "Benefits Calc" tab. Check tab name in Config.gs.'] };
    }
    var tcoSheet = ss.getSheetByName(config.tabs.LEGACY_TCO);
    if (!tcoSheet) {
      return { success: false, errors: ['Could not find "Legacy TCO" tab. Check tab name in Config.gs.'] };
    }

    // Write Data Input tab
    config.dataInput.fields.forEach(function(field) {
      var value = formData[field.id];
      if (value === null || value === undefined || value === '') return;
      var cellRef = config.dataInput.writeCol + field.row;
      diSheet.getRange(cellRef).setValue(toSheetValue(value, field.storeAs));
    });

    // Write Benefits Calc tab
    config.benefitsCalc.fields.forEach(function(field) {
      var impValue = formData[field.id];
      var incValue = formData[field.id + '_include'];

      if (impValue !== null && impValue !== undefined && impValue !== '') {
        var impCell = config.benefitsCalc.improvementCol + field.row;
        bcSheet.getRange(impCell).setValue(toSheetValue(impValue, field.storeAs));
      }

      var incCell = config.benefitsCalc.includeCol + field.row;
      bcSheet.getRange(incCell).setValue(incValue === false ? 'No' : 'Yes');
    });

    // Write Legacy TCO tab
    var onPremVal = formData['legacyOnPrem'];
    if (onPremVal !== null && onPremVal !== undefined && onPremVal !== '') {
      tcoSheet.getRange(config.legacyTco.onPremCell).setValue(String(onPremVal));
    }

    config.legacyTco.rows.forEach(function(row) {
      var unitCostVal = formData[row.id + '_unitCost'];
      var qtyVal      = formData[row.id + '_qty'];
      var includeVal  = formData[row.id + '_include'];

      if (unitCostVal !== null && unitCostVal !== undefined && unitCostVal !== '') {
        tcoSheet.getRange(config.legacyTco.unitCostCol + row.row)
          .setValue(toSheetValue(unitCostVal, 'currency'));
      }
      if (qtyVal !== null && qtyVal !== undefined && qtyVal !== '') {
        tcoSheet.getRange(config.legacyTco.qtyCol + row.row)
          .setValue(toSheetValue(qtyVal, row.qtyStoreAs));
      }
      tcoSheet.getRange(config.legacyTco.includeCol + row.row)
        .setValue(includeVal === false ? 'No' : 'Yes');
    });

    // Force recalculation
    SpreadsheetApp.flush();

    return { success: true, errors: [] };

  } catch (e) {
    return { success: false, errors: ['Unexpected error: ' + e.message] };
  }
}

/**
 * Converts a wizard display value to the correct sheet storage value.
 */
function toSheetValue(value, storeAs) {
  if (value === null || value === undefined || value === '') return '';
  switch (storeAs) {
    case 'decimal':
      return parseFloat(value) / 100;
    case 'number':
      return parseFloat(value);
    case 'currency':
      return parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    case 'text':
      return String(value).trim();
    default:
      return value;
  }
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Server-side validation. Returns array of error strings (empty = valid).
 */
function validateFormData(formData) {
  var errors = [];
  var config = getSheetConfig();

  config.dataInput.fields.forEach(function(field) {
    var value = formData[field.id];
    var isEmpty = (value === null || value === undefined || String(value).trim() === '');

    if (field.required && isEmpty) {
      errors.push(field.label + ' is required.');
      return;
    }
    if (!isEmpty && field.type !== 'text') {
      var num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (isNaN(num)) {
        errors.push(field.label + ' must be a number.');
      } else if (field.min !== undefined && num < field.min) {
        errors.push(field.label + ' must be at least ' + field.min + '.');
      } else if (field.max !== undefined && num > field.max) {
        errors.push(field.label + ' must be at most ' + field.max + '.');
      }
    }
  });

  config.benefitsCalc.fields.forEach(function(field) {
    var value = formData[field.id];
    if (value !== null && value !== undefined && value !== '') {
      var num = parseFloat(value);
      if (isNaN(num)) {
        errors.push(field.label + ' improvement must be a number.');
      } else if (num < field.min || num > field.max) {
        errors.push(field.label + ' must be between ' + field.min + '% and ' + field.max + '%.');
      }
    }
  });

  config.legacyTco.rows.forEach(function(row) {
    var unitCost = formData[row.id + '_unitCost'];
    if (unitCost !== null && unitCost !== undefined && unitCost !== '') {
      var num = parseFloat(String(unitCost).replace(/[^0-9.-]/g, ''));
      if (isNaN(num) || num < 0) {
        errors.push(row.label + ' unit cost must be a positive number.');
      }
    }
    var qty = formData[row.id + '_qty'];
    if (qty !== null && qty !== undefined && qty !== '') {
      var qnum = parseFloat(qty);
      if (isNaN(qnum) || qnum < 0) {
        errors.push(row.label + ' quantity must be a positive number.');
      }
    }
  });

  return errors;
}

// ─── Clear Inputs ─────────────────────────────────────────────────────────────

/**
 * Clears all yellow input cells after user confirmation.
 */
function clearAllInputs() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Clear All Inputs',
    'This will clear all input values from the Data Input, Benefits Calc, and Legacy TCO tabs. Are you sure?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var config = getSheetConfig();

  // Clear Data Input
  var diSheet = ss.getSheetByName(config.tabs.DATA_INPUT);
  if (diSheet) {
    config.dataInput.fields.forEach(function(field) {
      diSheet.getRange(config.dataInput.writeCol + field.row).clearContent();
    });
  }

  // Clear Benefits Calc
  var bcSheet = ss.getSheetByName(config.tabs.BENEFITS_CALC);
  if (bcSheet) {
    config.benefitsCalc.fields.forEach(function(field) {
      bcSheet.getRange(config.benefitsCalc.improvementCol + field.row).clearContent();
      bcSheet.getRange(config.benefitsCalc.includeCol + field.row).clearContent();
    });
  }

  // Clear Legacy TCO
  var tcoSheet = ss.getSheetByName(config.tabs.LEGACY_TCO);
  if (tcoSheet) {
    config.legacyTco.rows.forEach(function(row) {
      tcoSheet.getRange(config.legacyTco.unitCostCol + row.row).clearContent();
      tcoSheet.getRange(config.legacyTco.qtyCol      + row.row).clearContent();
      tcoSheet.getRange(config.legacyTco.includeCol  + row.row).clearContent();
    });
  }

  SpreadsheetApp.flush();
  ui.alert('Done', 'All inputs have been cleared.', ui.ButtonSet.OK);
}
