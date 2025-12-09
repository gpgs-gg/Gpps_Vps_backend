const { google } = require('googleapis');
const { Readable } = require('stream');
const mime = require('mime-types');

// ===== Upload Helper =====
// const uploadToGoogleDrive = async (fileBuffer, filename, folderId = 'root') => {
//     const auth = new google.auth.GoogleAuth({
//         credentials: {
//             client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
//             private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//         },
//         scopes: ['https://www.googleapis.com/auth/drive'],
//     });

//     const drive = google.drive({ version: 'v3', auth });
//     const mimeType = mime.lookup(filename) || 'application/octet-stream';

//     const bufferStream = new Readable();
//     bufferStream.push(fileBuffer);
//     bufferStream.push(null);

//     const file = await drive.files.create({
//         resource: { name: filename, parents: [folderId] },
//         media: { mimeType, body: bufferStream },
//         fields: 'id, name, mimeType, webViewLink, webContentLink',
//         supportsAllDrives: true,
//     });

//     await drive.permissions.create({
//         fileId: file.data.id,
//         requestBody: { role: 'reader', type: 'anyone' },
//         supportsAllDrives: true,
//     });

//     return {
//         id: file.data.id,
//         name: file.data.name,
//         drivePreview: file.data.webViewLink,
//         directDownload: file.data.webContentLink,
//         url: `${process.env.NEXT_PUBLIC_BASE_URL}/google-drive-file/${file.data.id}/${encodeURIComponent(file.data.name)}`,
//     };
// };

const uploadToGoogleDrive = async (fileBuffer, filename, properCode, clientName) => {


  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Helper: find or create folder under a parent folder
  const getOrCreateFolder = async (name, parentId = 'root') => {
    const query = [
      `name='${name.replace(/'/g, "\\'")}'`,
      `mimeType='application/vnd.google-apps.folder'`,
      `'${parentId}' in parents`,
      'trashed=false'
    ].join(' and ');

    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'allDrives',
    });

    if (res.data.files && res.data.files.length > 0) {
      // ✅ Folder already exists
      return res.data.files[0].id;
    }

    // 🚀 Create folder if not found
    const folder = await drive.files.create({
      resource: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });

    return folder.data.id;
  };

  const sharedDriveId = process.env.EMPLOYEE_ATTENDANCE_FOLDER_ID;

  // ✅ Ensure properCode folder exists (or create it)
  const propertyCodeFolderId = await getOrCreateFolder(properCode, sharedDriveId);

  // ✅ Ensure clientName folder exists inside properCode folder
  //   const clientFolderId = await getOrCreateFolder(clientName, propertyCodeFolderId);

  // ✅ Detect MIME type from filename
  const mimeType = mime.lookup(filename) || 'application/octet-stream';

  const fileMetadata = {
    name: filename,
    parents: [propertyCodeFolderId],
  };

  const bufferStream = new Readable();
  bufferStream.push(fileBuffer);
  bufferStream.push(null);

  const media = { mimeType, body: bufferStream };

  // ✅ Upload file to Google Drive
  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
    supportsAllDrives: true,
  });

  // ✅ Make file public
  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
    supportsAllDrives: true,
  });

  // ✅ Return metadata
  return {
    id: file.data.id,
    name: file.data.name,
    mimeType: file.data.mimeType,
    size: file.data.size,
    drivePreview: file.data.webViewLink,
    directDownload: file.data.webContentLink,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/google-drive-file/${file.data.id}/${encodeURIComponent(file.data.name)}`,
  };
};


// ===== Main Function =====
const CheckInOut = async (req, res) => {

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = "16sWGF4GPIX3D3VVQjnOc6JV8N0kC7aa-pACuiGjeoKo";

    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let sheetTitle = req.body.selectedMonth
      ? req.body.selectedMonth
      : `${monthNames[now.getMonth()]}${now.getFullYear()}`;


    // Get headers
    const headerResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetTitle}!1:1` });
    const headers = headerResponse.data.values?.[0] || [];
    if (headers.length === 0) return res.status(400).json({ error: 'Header row is empty.' });

    // Get all rows
    const dataResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetTitle}!A2:Z` });
    const rows = dataResponse.data.values || [];

    const dateColumnIndex = headers.indexOf('Date');
    const empIdColumnIndex = headers.indexOf('EmployeeID');

    if (dateColumnIndex === -1 || empIdColumnIndex === -1)
      return res.status(400).json({ error: 'Date or EmployeeID column not found.' });

    // Convert payload values
    const reqDate = new Date(req.body.Date).toDateString();
    const reqEmpID = String(req.body.EmployeeID);

    // Find matching row
    let rowIndexToUpdate = -1;
    for (let i = 0; i < rows.length; i++) {
      const rowDate = new Date(rows[i][dateColumnIndex]).toDateString();
      const rowEmpID = String(rows[i][empIdColumnIndex]);
      if (rowDate === reqDate && rowEmpID === reqEmpID) {
        rowIndexToUpdate = i + 2; // +2 for header row
        break;
      }
    }

    if (rowIndexToUpdate === -1) {
      return res.status(404).json({ error: 'No matching row found.' });
    }

    const existingRow = rows[rowIndexToUpdate - 2] || [];

    // Handle file upload if InSelfie exists
    const uploadedFileURLs = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const url = await uploadToGoogleDrive(file.buffer, file.originalname, `${req.body.EmployeeID}-${req.body.Name}`, req.body.Name);
        uploadedFileURLs.push(url.url); // store only URL
      }
    }

    // Prepare updated row values
    const updatedRow = headers.map(header => {
      // Determine which selfie field should be updated
      let selfieFieldToUpdate = null;
      if (req.body.action === 'Check In') selfieFieldToUpdate = 'InSelfie';
      else if (req.body.action === 'Check Out') selfieFieldToUpdate = 'OutSelfie';

      // Update only the correct selfie field if files are uploaded
      if (header === selfieFieldToUpdate && uploadedFileURLs && uploadedFileURLs.length > 0) {
        return uploadedFileURLs.join(',');
      }

      // Use value from request body if present
      if (req.body[header] !== undefined && req.body[header] !== null) {
        return req.body[header];
      }

      // Otherwise, keep existing value
      return existingRow[headers.indexOf(header)] || '';
    });


    // Update the row in sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A${rowIndexToUpdate}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] },
    });

    res.status(200).json({
      message: '✅ Row updated successfully',
      rowIndex: rowIndexToUpdate,
      updatedRow,
      files: uploadedFileURLs,
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Failed to update row.', details: error.message });
  }
};

module.exports = { CheckInOut };
