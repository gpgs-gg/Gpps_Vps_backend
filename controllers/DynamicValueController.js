const { GoogleSpreadsheet } = require("google-spreadsheet");
const { AllSheetNames } = require("../Config");

const fetchDynamicSheetData = async (req, res) => {
  const spreadsheetId = "1hbBBJbNijhM3M2JMZzshk_8EsXzdcns5X0wfqRu0uOE";
  const sheetTitle = AllSheetNames.DYNAMIC_MASTER_TABLE;

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





const fetchDynamicSheetDataForAandSD = async (req, res) => {
  const spreadsheetId = "1hbBBJbNijhM3M2JMZzshk_8EsXzdcns5X0wfqRu0uOE";
  const sheetTitle = AllSheetNames.DYNAMIC_MASTER_TABLEAandSD;

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
  fetchDynamicSheetData,
  fetchDynamicSheetDataForAandSD
};



























// // const { GoogleSpreadsheet } = require("google-spreadsheet");
// const { AllSheetNames } = require("../Config");

// const sheets = require("../googleSheets");

// // =======================
// // FIRST FUNCTION (Already OK)
// // =======================

// const fetchDynamicSheetData = async (req, res) => {
//   const sheetTitle = AllSheetNames.DYNAMIC_MASTER_TABLE;

//   try {
//     const doc = sheets.dynamicSheet;
//     const sheet = doc.sheetsByTitle[sheetTitle];

//     const rows = await sheet.getRows();
//     const headers = sheet.headerValues;

//     const data = rows.map(row => {
//       const rowData = {};
//       headers.forEach((h, i) => {
//         rowData[h] = row._rawData[i] || "";
//       });
//       return rowData;
//     });

//     res.json({ success: true, total: data.length, data });

//   } catch (err) {
//     res.status(500).json({ success: false, message: "Error fetching" });
//   }
// };


// // =======================
// // SECOND FUNCTION — FIXED
// // =======================

// const fetchDynamicSheetDataForAandSD = async (req, res) => {
//   const sheetTitle = AllSheetNames.DYNAMIC_MASTER_TABLEAandSD;

//   try {
//     const doc = sheets.dynamicSheetAandSD;   // <-- same structure like first one
//     const sheet = doc.sheetsByTitle[sheetTitle];

//     const rows = await sheet.getRows();
//     const headers = sheet.headerValues;      // <-- no formatting, same as first

//     const data = rows.map(row => {
//       const rowData = {};
//       headers.forEach((h, i) => {
//         rowData[h] = row._rawData[i] || "";
//       });
//       return rowData;
//     });

//     return res.json({ success: true, total: data.length, data });

//   } catch (err) {
//     console.error("Error fetching:", err.message);
//     return res.status(500).json({ success: false, message: "Error fetching" });
//   }
// };


// // =======================
// // EXPORT
// // =======================

// module.exports = {
//   fetchDynamicSheetData,
//   fetchDynamicSheetDataForAandSD
// };
