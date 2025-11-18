const { AllSheetNames } = require("../Config");
const { google } = require('googleapis');

const changePassword = async (req, res) => {
  const { LoginID } = req.body;

  console.log("Received request body:", req.body);

  if (!LoginID) {
    return res.status(400).json({ error: '❌ Missing "LoginID" in request body.' });
  }

  const primarySheetId = "1qU4HIzA6gidPPVItkUOCczLxPsLowasSFG4V2y7TuYU";
  const fallbackSheetId = "1AWJQlzuoxkhuR75GMq1EFpqexqDuI1WsxI14BON1olU";

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Helper function to update row in a given spreadsheet and sheet
  const updateSheet = async (spreadsheetId, sheetTitle) => {
    // Get headers
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!1:1`,
    });

    const headers = headerRes.data.values?.[0] || [];
    if (headers.length === 0) {
      throw new Error(`❌ Header row is empty or missing in sheet "${sheetTitle}".`);
    }

    const loginIdIndex = headers.indexOf("LoginID");
    if (loginIdIndex === -1) {
      throw new Error(`❌ "Login ID" column not found in sheet "${sheetTitle}".`);
    }

    // Get all rows
    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!A2:AZ`,  
    });   

    const rows = dataRes.data.values || [];

    // Find row by LoginID
    const matchRowIndex = rows.findIndex(
      row => (row[loginIdIndex] || "").trim().toLowerCase() === LoginID.trim().toLowerCase()
    );

    if (matchRowIndex === -1) {
      return null; // Not found
    }

    const existingRow = rows[matchRowIndex] || [];

    // Build updated row
    const updatedRow = headers.map((header, colIndex) => {
      const newValue = req.body.hasOwnProperty(header) ? req.body[header] : undefined;
      const existingValue = existingRow[colIndex] || "";

      if (newValue !== undefined && newValue !== null) {
        if (typeof newValue === "string" && newValue.trim().startsWith("=")) {
          return newValue.trim();
        }
        if (["string", "number", "boolean"].includes(typeof newValue)) {
          return newValue;
        }
      }

      return existingValue;
    });

    // Update row in the sheet
    const sheetRowNumber = matchRowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A${sheetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    return {
      updatedRow,
      sheetTitle,
    };
  };

  try {
    // Try updating in the primary sheet
    // Try updating in the primary sheet
    const primaryResult = await updateSheet(primarySheetId, AllSheetNames.EMPLOYEE_MASTER_TABLE);

    if (primaryResult) {
      return res.status(200).json({
        message: `✅ Row for LoginID "${LoginID}" updated successfully in "${primaryResult.sheetTitle}".`,
        updated: primaryResult.updatedRow,
      });
    }

    console.log("🔁 Primary sheet did not match. Trying fallback sheet...");

    // Fallback to MasterList
    const fallbackResult = await updateSheet(fallbackSheetId, "MasterList");

    if (fallbackResult) {
      return res.status(200).json({
        message: `✅ Row for LoginID "${LoginID}" updated successfully in fallback sheet "${fallbackResult.sheetTitle}".`,
        updated: fallbackResult.updatedRow,
      });
    }

    console.log("❌ Not found in fallback either.");

    // Not found in either sheet
    return res.status(404).json({
      error: `❌ LoginID "${LoginID}" not found in any sheet.`,
    });

  } catch (error) {
    console.error("❌ Error updating row:", error);
    return res.status(500).json({
      error: '❌ Failed to update row.',
      details: error.message,
    });
  }
};

module.exports = {
  changePassword,
};

















































// const sheets = require("../googleSheets");
// const { AllSheetNames } = require("../Config");

// const changePassword = async (req, res) => {
//   const { LoginID } = req.body;
//   if (!LoginID) return res.status(400).json({ error: 'Missing "LoginID"' });

//   // Converts GoogleSheet Row → Safe JSON (no circular structure)
//   const makeSafeRow = (row) => {
//     const safeObj = {};
//     Object.keys(row._sheet.headerValues).forEach((header) => {
//       safeObj[header] = row[header] || "";
//     });
//     return safeObj;
//   };

//   // Helper to update sheet
//   const updateSheet = async (sheetDoc, sheetTitle) => {
//     const sheet = sheetDoc.sheetsByTitle[sheetTitle];
//     if (!sheet) throw new Error(`Sheet "${sheetTitle}" not found`);

//     const rows = await sheet.getRows();
//     if (!rows.length) return null;

//     // Find row by LoginID
//     const row = rows.find(
//       (r) =>
//         (r.LoginID || "").trim().toLowerCase() ===
//         LoginID.trim().toLowerCase()
//     );
//     if (!row) return null;

//     // Update row fields from body
//     Object.keys(req.body).forEach((key) => {
//       if (row.hasOwnProperty(key)) row[key] = req.body[key];
//     });

//     await row.save();

//     return makeSafeRow(row); // return safe JSON only
//   };

//   try {
//     // Try in primary sheet
//     const updatedPrimary = await updateSheet(
//       sheets.primarySheetId,
//       AllSheetNames.EMPLOYEE_MASTER_TABLE
//     );

//     if (updatedPrimary)
//       return res.status(200).json({
//         message: "Updated in primary sheet",
//         updated: updatedPrimary,
//       });

//     // Try in fallback sheet
//     const updatedFallback = await updateSheet(
//       sheets.fallbackSheetId,
//       "MasterList"
//     );

//     if (updatedFallback)
//       return res.status(200).json({
//         message: "Updated in fallback sheet",
//         updated: updatedFallback,
//       });

//     // Not found
//     return res.status(404).json({
//       error: `LoginID "${LoginID}" not found in any sheet.`,
//     });
//   } catch (err) {
//     console.error("Error updating row:", err);
//     return res.status(500).json({
//       error: "Failed to update row",
//       details: err.message,
//     });
//   }
// };

// module.exports = { changePassword };
