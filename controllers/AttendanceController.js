const { GoogleSpreadsheet } = require("google-spreadsheet");
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

module.exports = {
  fetchSallaryTrackerDetailSheetData,
  fetchAttendanceDetailSheetData
};
