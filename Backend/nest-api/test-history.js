const axios = require('axios');

async function testFetch() {
  try {
    const res = await axios.get('http://localhost:3000/api/v1/csv-import/history?categoryKey=perizinan-aset');
    console.log(JSON.stringify(res.data.slice(0, 2), null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
testFetch();
