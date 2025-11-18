// const { GoogleSpreadsheet } = require("google-spreadsheet");

// let doc;

// async function initGoogleSheet() {
//   try {
//     doc = new GoogleSpreadsheet("1hbBBJbNijhM3M2JMZzshk_8EsXzdcns5X0wfqRu0uOE");

//     await doc.useServiceAccountAuth({
//       client_email: process.env.GOOGLE_CLIENT_EMAIL,
//       private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     });

//     await doc.loadInfo();

//     console.log("Google Sheet Connected Successfully!");
//   } catch (error) {
//     console.error("Error initializing Google Sheet:", error);
//   }
// }

// initGoogleSheet();x

// module.exports = doc;
///////////////////////////////////////////////////////////////////
// const { GoogleSpreadsheet } = require("google-spreadsheet");

// const SHEETS = {
//   dynamicSheet: "1hbBBJbNijhM3M2JMZzshk_8EsXzdcns5X0wfqRu0uOE",
//   dynamicSheetAandSD: "1hbBBJbNijhM3M2JMZzshk_8EsXzdcns5X0wfqRu0uOE",
//   attendanceSheet: "16sWGF4GPIX3D3VVQjnOc6JV8N0kC7aa-pACuiGjeoKo",
//   sallaryTrakerSheet: "1obwi57lOWuJvnq6dybq0_2Rs743nQqhdA_sBKmjHs88",
//   bedsAvilable: "1EUnGZWk9LWwAE-WIcYfOTpeQwnzy7AK3ct7_FTkbtxs",
//   primarySheetId: "1qU4HIzA6gidPPVItkUOCczLxPsLowasSFG4V2y7TuYU",   // for change password
//   fallbackSheetId: "1AWJQlzuoxkhuR75GMq1EFpqexqDuI1WsxI14BON1olU", // for change password
//   clientSheetId: "1AWJQlzuoxkhuR75GMq1EFpqexqDuI1WsxI14BON1olU",
//   ticketSheetId : "1kHjPWalsEaPO6IS756N43IFk7z1xRcrDeO6VG2AurwI"
// };

// const loadedSheets = {};

// async function initGoogleSheets() {
//   try {
//     for (const key in SHEETS) {
//       const doc = new GoogleSpreadsheet(SHEETS[key]);

//       await doc.useServiceAccountAuth({
//         client_email: process.env.GOOGLE_CLIENT_EMAIL,
//         private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//       });

//       await doc.loadInfo();

//       loadedSheets[key] = doc;

//       console.log(`Connected → ${key}`);
//     }

//   } catch (error) {
//     console.error("Error initializing Google Sheets:", error);
//   }
// }

// initGoogleSheets();

// module.exports = loadedSheets;
///////////////////////////////////////////////////////////////////


// const { GoogleSpreadsheet } = require("google-spreadsheet");

// const SHEETS = {
//   dynamicSheet: "1hbBBJbNijhM3M2JMZzshk_8EsXzdcns5X0wfqRu0uOE",
//   attendanceSheet: "16sWGF4GPIX3D3VVQjnOc6JV8N0kC7aa-pACuiGjeoKo",
//   sallaryTrakerSheet: "1obwi57lOWuJvnq6dybq0_2Rs743nQqhdA_sBKmjHs88",
//   bedsAvilable: "1EUnGZWk9LWwAE-WIcYfOTpeQwnzy7AK3ct7_FTkbtxs",
//   primarySheetId: "1qU4HIzA6gidPPVItkUOCczLxPsLowasSFG4V2y7TuYU",
//   fallbackSheetId: "1AWJQlzuoxkhuR75GMq1EFpqexqDuI1WsxI14BON1olU",
//   clientSheetId: "1AWJQlzuoxkhuR75GMq1EFpqexqDuI1WsxI14BON1olU",
//   ticketSheetId : "1kHjPWalsEaPO6IS756N43IFk7z1xRcrDeO6VG2AurwI"
// };

// const loadedSheets = {};
// let sheetsReady = false;

// async function initGoogleSheets() {
//   try {
//     for (const key in SHEETS) {
//       const doc = new GoogleSpreadsheet(SHEETS[key]);
//       await doc.useServiceAccountAuth({
//         client_email: process.env.GOOGLE_CLIENT_EMAIL,
//         private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//       });
//       await doc.loadInfo();
//       loadedSheets[key] = doc;
//       console.log(`✅ Connected → ${key}`);
//     }
//     sheetsReady = true;
//   } catch (error) {
//     console.error("❌ Error initializing Google Sheets:", error);
//   }
// }

// // Init sheets immediately
// initGoogleSheets();

// // Export both the loadedSheets and a promise to wait for readiness
// module.exports = { loadedSheets, waitForSheets: async () => {
//   while (!sheetsReady) {
//     await new Promise(resolve => setTimeout(resolve, 50));
//   }
// }};
