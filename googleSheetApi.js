

//   const { google } = require('googleapis');

//   let sheetsClient;

//   function initSheets() {
//     if (!sheetsClient) {
//       const auth = new google.auth.GoogleAuth({
//         credentials: {
//           client_email: process.env.GOOGLE_CLIENT_EMAIL,
//           private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//         },
//         scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//       });

//       sheetsClient = google.sheets({ version: 'v4', auth });
//       console.log('✅ Google Sheets client initialized!');
//     }
//     return sheetsClient;
//   }

//   module.exports = initSheets();

