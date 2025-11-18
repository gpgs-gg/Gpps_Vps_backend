const { GoogleSpreadsheet } = require("google-spreadsheet");
const { google } = require('googleapis');



async function createClientLeads(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1XbSWQ1yTMLVEfo0Kvx94Xr5Gv52URCgUaFks8SUPvAU';
    const sheetName = 'NewLeads';
    const data = req.body;

    // 🔹 Fetch existing rows
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:N`,
    });

    const rows = existingData.data.values || [];
    const srNo = rows.length + 1;

    // 📅 Proper date
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = `${String(now.getDate()).padStart(2, "0")} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // 🧠 Prepare new row
    const newRow = [
      srNo.toString(),
      today,
      data.ClientName || "",
      data.MaleFemale?.value || data.MaleFemale || "",
      data.CallingNo || "",
      data.WhatsAppNo || "",
      data.LeadSource?.value || data.LeadSource || "",
      data.WhatsAppCommunication?.value || data.WhatsAppCommunication || "",
      data.PhoneCallCommunication?.value || data.PhoneCallCommunication || "",
      data.visited?.value || data.visited || "",
      data.FollowUpDate || "",
      data.Comments || "",
      data.BookingDone || "",
      data.BookingNotDoneComments || ""
    ];

    // ✅ Add new row at top (A2)
    const updatedData = [newRow, ...rows];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A2:N`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: updatedData },
    });

    res.status(200).json({ message: "Client added at TOP successfully!" });
  } catch (error) {
    console.error("❌ Error adding client:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const { srNo, data } = req.body;

    if (!srNo || !data) {
      return res.status(400).json({ message: "Missing srNo or data in request" });
    }

    const spreadsheetId = '1XbSWQ1yTMLVEfo0Kvx94Xr5Gv52URCgUaFks8SUPvAU';
    const sheetName = 'NewLeads';

    // ✅ Fetch SrNo column
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:A10000`,
    });

    const rows = existingData.data.values || [];

    // ✅ Find matching srNo index
    const targetIndex = rows.findIndex(row => row[0] === srNo.toString());

    if (targetIndex === -1) {
      return res.status(404).json({ message: "SrNo not found in sheet" });
    }

    // ⭐ SrNo MUST NOT CHANGE
    const originalSrNo = srNo;

    // ⭐ Existing date should stay same
    const dateCell = (await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!B${targetIndex + 2}`,
    })).data.values?.[0]?.[0] || "";

    // ⭐ Prepare updated row
    const updatedRow = [
      originalSrNo.toString(),               // KEEP SAME SRNO
      dateCell,                             // KEEP OLD DATE
      data.ClientName || "",
      data.MaleFemale?.value || data.MaleFemale || "",
      data.CallingNo || "",
      data.WhatsAppNo || "",
      data.LeadSource?.value || data.LeadSource || "",
      data.WhatsAppCommunication?.value || data.WhatsAppCommunication || "",
      data.PhoneCallCommunication?.value || data.PhoneCallCommunication || "",
      data.visited?.value || data.visited || "",
      data.FollowUpDate || "",
      data.Comments || "",
      data.BookingDone || "",
      data.BookingNotDoneComments || ""
    ];

    const updateRange = `${sheetName}!A${targetIndex + 2}:N${targetIndex + 2}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [updatedRow] },
    });

    return res.status(200).json({ message: "Client updated successfully!" });

  } catch (error) {
    console.error("❌ Error updating client:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

module.exports = { createClientLeads, getAllClientsLeads, updateClientLeads };