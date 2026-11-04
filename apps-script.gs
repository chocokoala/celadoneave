// Celadon Eave — form collector (Google Apps Script)
// Paste into Extensions > Apps Script in the Google Sheet, then Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Copy the web app URL into FORM_ENDPOINT in assets/main.js.

var TABS = {
  signups: ['Timestamp', 'Email', 'Page'],
  contact: ['Timestamp', 'First name', 'Last name', 'Email', 'Location', 'Message', 'Page']
};
var NOTIFY = ''; // optional: your email address to be notified of contact messages

function doPost(e) {
  var p = e.parameter || {};
  var kind = p.form === 'contact' ? 'contact' : 'signups';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = kind === 'contact' ? 'Contact' : 'Signups';
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(TABS[kind]);

  var now = new Date();
  var row = kind === 'contact'
    ? [now, p.first_name, p.last_name, p.email, p.location, p.message, p.page]
    : [now, p.email, p.page];
  sheet.appendRow(row.map(function (v) { return v == null ? '' : String(v); }));

  if (kind === 'contact' && NOTIFY) {
    MailApp.sendEmail(NOTIFY, 'Celadon Eave contact: ' + (p.first_name || '') + ' ' + (p.last_name || ''),
      'From: ' + p.email + '\nLocation: ' + (p.location || '') + '\n\n' + (p.message || ''));
  }
  return ContentService.createTextOutput('ok');
}
