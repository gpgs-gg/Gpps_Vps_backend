const { GoogleSpreadsheet } = require("google-spreadsheet");
const { google } = require('googleapis');





async function createClientLeads(req, res) {
  try {
    // 🔑 Google Sheets auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "1XbSWQ1yTMLVEfo0Kvx94Xr5Gv52URCgUaFks8SUPvAU";
    const sheetName = "NewLeads";
    const data = req.body;

    // ----------------------------------------------------
    // 1️⃣ GET SHEET ID OF "NewLeads"
    // ----------------------------------------------------
    const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId });

    const sheet = spreadsheetInfo.data.sheets.find(
      (s) => s.properties.title === sheetName
    );

    if (!sheet) {
      return res.status(400).json({ message: "❌ Sheet not found!" });
    }

    const sheetId = sheet.properties.sheetId;

    // ----------------------------------------------------
    // 2️⃣ GET HEADERS (A1:N1)
    // ----------------------------------------------------
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:N1`,
    });

    const headers = headerRes.data.values[0];

    // ----------------------------------------------------
    // 3️⃣ GET EXISTING ROWS TO CALCULATE LeadNo
    // ----------------------------------------------------
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:N`,
    });

    const rows = existingData.data.values || [];
    const LeadNo = rows.length + 1;

    // ----------------------------------------------------
    // 4️⃣ GET TODAY DATE (formatted)
    // ----------------------------------------------------
    const now = new Date();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const today = `${String(now.getDate()).padStart(2,"0")} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // ----------------------------------------------------
    // 5️⃣ PREPARE NEW ROW VALUES
    // ----------------------------------------------------
    const newRow = headers.map((header) => {
      if (header === "LeadNo") return LeadNo.toString();
      if (header === "Date") return today;
      return data[header] ?? "";
    });

    // ----------------------------------------------------
    // 6️⃣ INSERT EMPTY ROW AT TOP (A2)
    // ----------------------------------------------------
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: sheetId,   // <-- the correct sheetId
                dimension: "ROWS",
                startIndex: 1,       // row 2 (0-based index)
                endIndex: 2
              },
              inheritFromBefore: false,
            },
          },
        ],
      },
    });

    // ----------------------------------------------------
    // 7️⃣ WRITE YOUR NEW DATA INTO A2
    // ----------------------------------------------------
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A2:N2`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [newRow],
      },
    });

    // ----------------------------------------------------
    // 8️⃣ RESPONSE
    // ----------------------------------------------------
    res.status(200).json({
      message: "✅ Client added at TOP successfully!",
      LeadNo,
    });

  } catch (error) {
    console.error("❌ Error adding client:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}






// 🟢 Get All Clients function
async function getAllClientsLeads(req, res) {

  const spreadsheetId = '1XbSWQ1yTMLVEfo0Kvx94Xr5Gv52URCgUaFks8SUPvAU';
  const sheetTitle = "NewLeads";

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
}



async function updateClientLeads(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const { data } = req.body;

    if (!data?.LeadNo) {
      return res.status(400).json({ message: "Missing LeadNo or data" });
    }

    const spreadsheetId = "1XbSWQ1yTMLVEfo0Kvx94Xr5Gv52URCgUaFks8SUPvAU";
    const sheetName = "NewLeads";

    // Read sheet
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:AZ`,
    });

    const rows = sheetData.data.values || [];
    if (rows.length === 0)
      return res.status(400).json({ message: "Sheet is empty" });

    const headers = rows[0];

    // Find the row with the LeadNo
    const targetIndex = rows.findIndex((row) => row[0] === data.LeadNo);
    if (targetIndex === -1) {
      return res.status(404).json({ message: "LeadNo not found" });
    }

    // Helper to clean header
    function cleanHeader(h) {
      return h.replace(/\s+/g, "").trim();
    }

    // Normalizer
    const normalize = (value) => value?.value || value || "";

    // Build updated row based on headers
    const updatedRow = headers.map((header, colIndex) => {
      const clean = cleanHeader(header);

      // Keep LeadNo and Date unchanged
      if (clean === "LeadNo") return data.LeadNo;
      if (clean === "Date") return rows[targetIndex][colIndex] || "";

      // Pick value from incoming data
      return normalize(data[clean]);
    });

    const rowNumber = targetIndex + 1;

    // Convert index → Excel column (A, B, ..., Z, AA, AB ...)
    function getColumnLetter(colIndex) {
      let letter = "";
      while (colIndex >= 0) {
        letter = String.fromCharCode((colIndex % 26) + 65) + letter;
        colIndex = Math.floor(colIndex / 26) - 1;
      }
      return letter;
    }

    const lastColumn = getColumnLetter(headers.length - 1);
    const updateRange = `${sheetName}!A${rowNumber}:${lastColumn}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "USER_ENTERED",
      resource: { values: [updatedRow] },
    });

    return res
      .status(200)
      .json({ message: "Client updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating client:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}


module.exports = { createClientLeads, getAllClientsLeads, updateClientLeads };