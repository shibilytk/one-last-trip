/**
 * Google Apps Script — "One Last Trip" Registration Backend
 * =========================================================
 * 
 * INSTRUCTIONS:
 * 1. Paste your Google Sheet ID in SHEET_ID below.
 *    (It is the long string in your sheet URL: /d/YOUR_SHEET_ID/edit)
 * 2. Click "Run" on testRun() to grant permissions and verify.
 * 3. Deploy -> New deployment -> Web app -> Anyone -> Deploy.
 */

// Google Sheet ID for "One Last Trip - Registrations":
const SHEET_ID = '1tnrcLMO7Ov6jTpn1R36hbCr6YUj5iW-bxn1cn61PLLM';

// Folder name in Google Drive where Aadhaar PDFs will be saved:
const FOLDER_NAME = 'One Last Trip - Aadhaar Uploads';


/**
 * Run this function ONCE inside Apps Script by clicking the "Run" button above.
 * This triggers Google's permission popup and verifies your Sheet connection.
 */
function testRun() {
  Logger.log("--- Starting Test ---");
  
  // 1. Test Sheet Connection
  const sheet = getTargetSheet();
  Logger.log("✅ Google Sheet connected successfully: " + sheet.getParent().getName() + " -> Tab: " + sheet.getName());
  
  // 2. Test Drive Connection & Permissions
  const folder = getOrCreateFolder();
  Logger.log("✅ Google Drive folder ready: " + folder.getName() + " (ID: " + folder.getId() + ")");
  
  // 3. Write a test row
  sheet.appendRow([
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    'Test Student',
    'Male',
    '20',
    '2004-01-01',
    "'9876543210",
    'test@student.com',
    'test.pdf',
    '15 KB',
    'Test Run Successful'
  ]);
  Logger.log("✅ Test row successfully written to your Google Sheet! Check your sheet now.");
}


/**
 * Handles incoming form submissions from the website
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No payload received in request");
    }

    const data = JSON.parse(e.postData.contents);
    Logger.log("Received submission for: " + data.fullName);

    // 1. Get the target sheet
    const sheet = getTargetSheet();

    // Setup headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Full Name',
        'Gender',
        'Age',
        'Date of Birth',
        'Phone Number',
        'Email Address',
        'Aadhaar File Name',
        'File Size',
        'Aadhaar PDF Link'
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#FFF5F5");
      sheet.setFrozenRows(1);
    }

    // 2. Save PDF to Google Drive
    let fileUrl = 'No file attached';
    if (data.fileData) {
      try {
        const folder = getOrCreateFolder();
        const decodedBytes = Utilities.base64Decode(data.fileData);
        const safeName = (data.fullName ? data.fullName.replace(/[^a-zA-Z0-9]/g, '_') : 'Student') + '_Aadhaar.pdf';
        const blob = Utilities.newBlob(decodedBytes, 'application/pdf', safeName);
        
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
        Logger.log("File saved: " + fileUrl);
      } catch (fileError) {
        Logger.log("Drive upload error: " + fileError.toString());
        fileUrl = "Upload failed: " + fileError.toString();
      }
    }

    // 3. Smart Header Mapping (maps data to exact column header names)
    const numCols = Math.max(sheet.getLastColumn(), 10);
    const headers = sheet.getRange(1, 1, 1, numCols).getValues()[0];
    const newRow = new Array(numCols).fill('');

    for (let i = 0; i < numCols; i++) {
      const h = String(headers[i] || '').toLowerCase().trim();
      if (h.includes('time')) {
        newRow[i] = data.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      } else if (h.includes('age')) {
        newRow[i] = data.age || '';
      } else if (h.includes('birth') || h.includes('dob')) {
        newRow[i] = data.dob || '';
      } else if (h.includes('name') && !h.includes('file')) {
        newRow[i] = data.fullName || '';
      } else if (h.includes('gender') || h.includes('sex')) {
        newRow[i] = data.gender || '';
      } else if (h.includes('phone') || h.includes('mobile') || h.includes('contact')) {
        newRow[i] = "'" + (data.phone || '');
      } else if (h.includes('email') || h.includes('mail')) {
        newRow[i] = data.email || '';
      } else if (h.includes('file name') || h.includes('filename') || h.includes('aadhaar file')) {
        newRow[i] = data.fileName || '';
      } else if (h.includes('size')) {
        newRow[i] = formatBytes(data.fileSize);
      } else if (h.includes('link') || h.includes('drive') || h.includes('url')) {
        newRow[i] = fileUrl;
      }
    }

    sheet.appendRow(newRow);

    Logger.log("Success: Record appended for " + data.fullName);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Registration saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("FATAL ERROR in doPost: " + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles GET requests (for browser URL check)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'active',
      message: 'One Last Trip Backend is running properly!',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: Find or create the Drive folder
 */
function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(FOLDER_NAME);
}

/**
 * Helper: Get sheet by ID or active spreadsheet
 */
function getTargetSheet() {
  // If SHEET_ID is provided, open it directly
  if (SHEET_ID && SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID_HERE') {
    try {
      return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    } catch (e) {
      Logger.log("openById failed: " + e.toString());
    }
  }

  // Otherwise try container-bound spreadsheet
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss.getSheets()[0];
  } catch (e) {}

  throw new Error("Could not connect to Google Sheet. Please copy your Sheet ID from the browser URL and paste it into SHEET_ID at the top of this script.");
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
