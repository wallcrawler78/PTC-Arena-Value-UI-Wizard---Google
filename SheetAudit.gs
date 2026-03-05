/**
 * SheetAudit.gs
 * Diagnostic function to verify wizard-to-sheet cell alignment.
 * Run this from the Apps Script editor (Tools > Run function > runSheetAudit)
 * to confirm all wizard fields map correctly to the spreadsheet.
 */

function runSheetAudit() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var config = getSheetConfig();
  var report = [];
  var warnings = [];

  report.push('=== Arena Value Wizard — Sheet Audit ===');
  report.push('Run date: ' + new Date().toISOString());
  report.push('');

  // --- Audit Data Input Tab ---
  report.push('--- DATA INPUT TAB (' + config.tabs.DATA_INPUT + ') ---');
  var diSheet = ss.getSheetByName(config.tabs.DATA_INPUT);
  if (!diSheet) {
    report.push('ERROR: Tab not found: ' + config.tabs.DATA_INPUT);
  } else {
    config.dataInput.fields.forEach(function(field) {
      var cellRef = config.dataInput.writeCol + field.row;
      var range = diSheet.getRange(cellRef);
      var value = range.getValue();
      var formula = range.getFormula();
      var hasFormula = formula && formula.trim() !== '';

      var status = 'OK';
      var note = '';

      if (hasFormula) {
        status = 'WARNING';
        note = 'Cell has formula: ' + formula + ' (wizard should only write to input/yellow cells)';
        warnings.push(field.id + ' (' + cellRef + '): ' + note);
      }

      report.push('[' + status + '] ' + field.id + ' → ' + cellRef +
                  ' | value: ' + JSON.stringify(value) +
                  ' | storeAs: ' + field.storeAs +
                  (note ? ' | NOTE: ' + note : ''));
    });
  }

  report.push('');
  report.push('--- BENEFITS CALC TAB (' + config.tabs.BENEFITS_CALC + ') ---');
  var bcSheet = ss.getSheetByName(config.tabs.BENEFITS_CALC);
  if (!bcSheet) {
    report.push('ERROR: Tab not found: ' + config.tabs.BENEFITS_CALC);
  } else {
    config.benefitsCalc.fields.forEach(function(field) {
      var impRef = config.benefitsCalc.improvementCol + field.row;
      var incRef = config.benefitsCalc.includeCol + field.row;
      var calcRef = 'G' + field.row;

      var impRange = bcSheet.getRange(impRef);
      var incRange = bcSheet.getRange(incRef);
      var calcRange = bcSheet.getRange(calcRef);

      var impValue = impRange.getValue();
      var incValue = incRange.getValue();
      var calcValue = calcRange.getValue();
      var calcFormula = calcRange.getFormula();
      var impFormula = impRange.getFormula();

      var status = 'OK';
      var notes = [];

      if (impFormula && impFormula.trim() !== '') {
        status = 'WARNING';
        notes.push('Improvement col has formula — should be writable: ' + impFormula);
        warnings.push(field.id + ' (imp ' + impRef + '): has formula: ' + impFormula);
      }

      if (!calcFormula || calcFormula.trim() === '') {
        notes.push('Benefit calc col G' + field.row + ' has no formula (expected formula)');
      }

      report.push('[' + status + '] ' + field.id +
                  ' | imp(' + impRef + ')=' + JSON.stringify(impValue) +
                  ' | inc(' + incRef + ')=' + JSON.stringify(incValue) +
                  ' | calc(G' + field.row + ')=' + (calcFormula ? 'formula' : JSON.stringify(calcValue)) +
                  (notes.length ? ' | NOTES: ' + notes.join('; ') : ''));
    });
  }

  report.push('');
  report.push('--- SUMMARY ---');
  report.push('Warnings: ' + warnings.length);
  warnings.forEach(function(w) { report.push('  ⚠ ' + w); });
  report.push('Audit complete.');

  var output = report.join('\n');
  Logger.log(output);

  // Also return structured data
  return {
    auditText: output,
    warningCount: warnings.length,
    warnings: warnings
  };
}
