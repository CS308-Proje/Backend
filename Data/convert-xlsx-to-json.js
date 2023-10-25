const fs = require('fs');
const XLSX = require('xlsx');

// Load the XLSX file
const workbook = XLSX.readFile('datos_merged_1986_2023.xlsx');

// Specify the sheet name (e.g., Sheet1)
const sheetName = 'Sheet1';

// Read the sheet data as an array of objects
const sheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(sheet);

// Save the JSON data to a file
fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2), 'utf8');

console.log('XLSX to JSON conversion completed.');
