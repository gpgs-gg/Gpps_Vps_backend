const { GoogleSpreadsheet } = require("google-spreadsheet");
const { google } = require('googleapis');

// const { AllSheetNames } = require("../Config");

const fetchAttendanceDetailSheetData = async (req, res) => {
  const spreadsheetId = "16sWGF4GPIX3D3VVQjnOc6JV8N0kC7aa-pACuiGjeoKo";
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sheetTitle = `${monthNames[now.getMonth()]}${now.getFullYear()}`;

  if (!spreadsheetId || !sheetTitle) {
    return res.status(400).json({ success: false, message: "Missing sheet ID or title" });
  }

  try {
    const doc = new GoogleSpreadsheet(spreadsheetId);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });

    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) {
      return res.status(404).json({ success: false, message: "Sheet not found" });
    }

    const rows = await sheet.getRows();
    const headers = sheet.headerValues.map(h => h.replace(/\n/g, ' ').trim());

    const data = rows.map(row => {
      const rowData = {};
      headers.forEach((header, i) => {
        rowData[header] = row._rawData[i] || "";
      });
      return rowData;
    });

    return res.json({ success: true, total: data.length, data });
  } catch (error) {
    console.error("Error fetching sheet:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch sheet data" });
  }
};


// const { AllSheetNames } = require("../Config");

const fetchSallaryTrackerDetailSheetData = async (req, res) => {
  const spreadsheetId = "1obwi57lOWuJvnq6dybq0_2Rs743nQqhdA_sBKmjHs88";
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // const sheetTitle = `${monthNames[now.getMonth()]}${now.getFullYear()}`;
  const sheetTitle = `ForIT-DoNotDelete`;

  if (!spreadsheetId || !sheetTitle) {
    return res.status(400).json({ success: false, message: "Missing sheet ID or title" });
  }

  try {
    const doc = new GoogleSpreadsheet(spreadsheetId);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });

    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) {
      return res.status(404).json({ success: false, message: "Sheet not found" });
    }

    const rows = await sheet.getRows();
    const headers = sheet.headerValues.map(h => h.replace(/\n/g, ' ').trim());

    const data = rows.map(row => {
      const rowData = {};
      headers.forEach((header, i) => {
        rowData[header] = row._rawData[i] || "";
      });
      return rowData;
    });

    return res.json({ success: true, total: data.length, data });
  } catch (error) {
    console.error("Error fetching sheet:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch sheet data" });
  }
};

const createSallaryDetails = async (req, res) => {
  try {
    // Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1obwi57lOWuJvnq6dybq0_2Rs743nQqhdA_sBKmjHs88";
    const sheetTitle = "ForIT-DoNotDelete";

    // Get headers & rows
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!A:AZ`,
    });

    const rows = sheetResponse.data.values || [];
    const headers = rows[0] || [];

    if (headers.length === 0) {
      return res.status(400).json({ error: "Headers not found in sheet" });
    }

    const empIdColumnIndex = headers.indexOf("EmployeeID");
    if (empIdColumnIndex === -1) {
      return res.status(400).json({ error: "EmployeeID column missing in sheet" });
    }

    const reqEmpID = String(req.body.EmployeeID || req.body.id);
    if (!reqEmpID) {
      return res.status(400).json({ error: "EmployeeID or id is required" });
    }

    // Find row to update
    let rowIndexToUpdate = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowEmpID = String(rows[i][empIdColumnIndex]);
      if (rowEmpID === reqEmpID) {
        rowIndexToUpdate = i + 1;
        break;
      }
    }

    if (rowIndexToUpdate === -1) {
      return res.status(404).json({ error: "Matching EmployeeID not found in sheet" });
    }

    const existingRow = rows[rowIndexToUpdate - 1] || [];

    // Upload selfies
    const uploadedFileURLs = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const url = await uploadToGoogleDrive(
          file.buffer,
          file.originalname,
          `${reqEmpID}-${req.body.Name || req.body.name}`,
          req.body.Name || req.body.name
        );
        uploadedFileURLs.push(url.url);
      }
    }

    // Build updated row (NO comment appending)
    const updatedRow = headers.map((header, idx) => {

      // ❌ No append — overwrite Comments normally
      if (header === "Comments") {
        if (req.body.Comments !== undefined && req.body.Comments !== null) {

          // If Comments is an array → join with new line
          if (Array.isArray(req.body.Comments)) {
            return req.body.Comments.join("\n");
          }

          // If it's a string → save directly
          return req.body.Comments;
        }

        return existingRow[idx] || "";
      }

      // Normal update
      if (req.body[header] !== undefined && req.body[header] !== null) {
        return req.body[header];
      }

      return existingRow[idx] || "";
    });

    // Update sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A${rowIndexToUpdate}`,
      valueInputOption: "RAW",
      requestBody: { values: [updatedRow] },
    });

    res.status(200).json({
      message: "✅ Row updated successfully",
      rowIndex: rowIndexToUpdate,
      updatedRow,
      uploadedFiles: uploadedFileURLs,
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({
      error: "Failed to update row",
      details: error.message,
    });
  }
};


module.exports = {
  fetchSallaryTrackerDetailSheetData,
  fetchAttendanceDetailSheetData,
  createSallaryDetails
};










// const sheets = require("../googleSheets");

// // Attendance Sheet API
// const fetchAttendanceDetailSheetData = async (req, res) => {
//   try {
//     const doc = sheets.attendanceSheet;

//     const now = new Date();
//     const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const sheetTitle = `${monthNames[now.getMonth()]}${now.getFullYear()}`;

//     const sheet = doc.sheetsByTitle[sheetTitle];
//     if (!sheet) return res.status(404).json({ success: false, message: "Sheet not found" });

//     const rows = await sheet.getRows();
//     const headers = sheet.headerValues.map(h => h.replace(/\n/g, ' ').trim());

//     const data = rows.map(row => {
//       const rowData = {};
//       headers.forEach((header, i) => rowData[header] = row._rawData[i] || "");
//       return rowData;
//     });

//     res.json({ success: true, total: data.length, data });
//   } catch (error) {
//     console.error("Error fetching attendance sheet:", error.message);
//     res.status(500).json({ success: false, message: "Failed to fetch sheet data" });
//   }
// };

// // Salary Tracker Sheet API
// const fetchSallaryTrackerDetailSheetData = async (req, res) => {
//   try {
//     const doc = sheets.sallaryTrakerSheet;
//     const sheetTitle = "ForIT-DoNotDelete";

//     const sheet = doc.sheetsByTitle[sheetTitle];
//     if (!sheet) return res.status(404).json({ success: false, message: "Sheet not found" });

//     const rows = await sheet.getRows();
//     const headers = sheet.headerValues.map(h => h.replace(/\n/g, ' ').trim());

//     const data = rows.map(row => {
//       const rowData = {};
//       headers.forEach((header, i) => rowData[header] = row._rawData[i] || "");
//       return rowData;
//     });

//     res.json({ success: true, total: data.length, data });
//   } catch (error) {
//     console.error("Error fetching salary tracker sheet:", error.message);
//     res.status(500).json({ success: false, message: "Failed to fetch sheet data" });
//   }
// };

// module.exports = {
//   fetchSallaryTrackerDetailSheetData,
//   fetchAttendanceDetailSheetData
// };








