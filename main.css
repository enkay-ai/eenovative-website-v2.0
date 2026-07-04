/**
 * EENOVATIVE TECHNOLOGIES — Contact Lead API
 * ------------------------------------------
 * Your website now lives on GitHub Pages (static hosting), so this
 * script no longer serves HTML. Instead it acts as a JSON API that
 * the website's contact form POSTs to, saving leads into the
 * "Contact Leads" sheet exactly as before.
 *
 * SETUP (one time):
 *  1. Open your Google Sheet -> Extensions -> Apps Script.
 *  2. Replace the old code with this file.
 *  3. Run setupDatabase() once (authorise when prompted).
 *  4. (Optional) Set NOTIFY_EMAIL below to get an email per lead.
 *  5. Deploy -> New deployment -> Type: Web app
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  6. Copy the Web app URL (ends in /exec) and paste it into
 *     js/site.js on the website (SCRIPT_URL constant).
 *
 * NOTE: The form sends Content-Type: text/plain with a JSON body.
 * This avoids the CORS preflight that Apps Script cannot answer,
 * and is the reliable pattern for static-site -> Apps Script calls.
 */

var NOTIFY_EMAIL = ''; // e.g. 'you@example.com' — leave blank to disable

function doPost(e) {
  var out;
  try {
    var form = JSON.parse(e.postData.contents);

    if (!form || !form.name || !form.email || !form.message) {
      throw new Error('Name, email and message are required.');
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Contact Leads');
    if (!sheet) {
      setupDatabase();
      sheet = ss.getSheetByName('Contact Leads');
    }

    var leadId = 'LEAD-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    sheet.appendRow([
      leadId,
      new Date(),
      String(form.name || '').trim(),
      String(form.email || '').trim(),
      String(form.phone || '').trim(),
      String(form.organisation || '').trim(),
      String(form.interest || '').trim(),
      String(form.timeline || '').trim(),
      String(form.message || '').trim(),
      'New',
      String(form.source || 'Website')
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: '[Eenovative] New lead: ' + form.name + (form.organisation ? ' — ' + form.organisation : ''),
        body: 'Lead ID: ' + leadId + '\n' +
              'Name: ' + form.name + '\n' +
              'Email: ' + form.email + '\n' +
              'Phone: ' + (form.phone || '-') + '\n' +
              'Organisation: ' + (form.organisation || '-') + '\n' +
              'Interest: ' + (form.interest || '-') + '\n' +
              'Timeline: ' + (form.timeline || '-') + '\n\n' +
              'Message:\n' + form.message
      });
    }

    out = { success: true, message: 'Message sent successfully. I will be in touch soon.' };
  } catch (err) {
    out = { success: false, message: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Health check — open the /exec URL in a browser to verify deployment. */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'Eenovative Contact Lead API' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Contact Leads');
  if (!sheet) sheet = ss.insertSheet('Contact Leads');

  var headers = [
    'LeadID', 'Timestamp', 'Name', 'Email', 'Phone', 'Organisation',
    'Interest Area', 'Budget/Timeline', 'Message', 'Status', 'Source'
  ];

  sheet.clear();
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, headers.length);
  return 'Database setup complete. Sheet created: Contact Leads';
}
