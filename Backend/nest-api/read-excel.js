const xlsx = require('xlsx');

function readExcel() {
  const workbook = xlsx.readFile('C:/Users/alvin/Documents/Coolyeah/PKT/Inventor/frontent/public/Template_perizinan Aset.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonArray = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log("Headers:", jsonArray[0]);
  console.log("Row 2:", jsonArray[1]);
  console.log("Row 3:", jsonArray[2]);
  console.log("Row 4:", jsonArray[3]);
}

readExcel();
