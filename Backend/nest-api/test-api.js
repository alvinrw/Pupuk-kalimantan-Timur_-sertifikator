const axios = require('axios');

async function test() {
  try {
    // Note: We don't have the user's token here, but let's see if we get a 401 or 403 without it
    const res = await axios.post('http://localhost:3000/api/v1/csv-import/bulk-nested', {
      data: [],
      categoryKey: 'perizinan-aset',
      fileName: 'test.csv'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error status:", err.response ? err.response.status : err.message);
    console.error("Error data:", err.response ? err.response.data : '');
  }
}

test();
