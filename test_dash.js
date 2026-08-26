const axios = require('axios');

async function test() {
  const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', { username: 'muhfi_admin', password: 'admin123' });
  const token = loginRes.data.access_token;
  const res = await axios.get('http://localhost:3000/api/v1/master-items', { headers: { Authorization: 'Bearer ' + token }});
  
  const rawItems = res.data;
  
  const calcDiff = (dStr) => {
    if (!dStr || dStr === '-' || dStr === '2030-01-01' || dStr.trim() === '') return -999;
    const expiry = new Date(dStr);
    if (isNaN(expiry.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getWfStatus = (st, docSt) => {
    const lowerSt = (st || '').toLowerCase();
    if (lowerSt === 'afkir' || lowerSt === 'decommissioned') return 'decommissioned';
    if (lowerSt === 'perpanjang' || lowerSt === 'perpanjangan' || lowerSt === 'in progress' || lowerSt === 'in_progress') return 'in_progress';
    if (docSt === 'EXEMPT') return 'exempt';
    return 'completed';
  };

  const flattened = [];
  rawItems.forEach(item => {
    if (item.documentStatus === 'PENDING_DOC') return;
    const certs = item.certificates || [];
    
    if (item.categoryKey === 'peralatan-pabrik') {
      // ...
    } else {
      if (certs.length === 0) {
        // ...
      } else {
        certs.forEach(cert => {
          const rawExp = cert.expired || '-';
          const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
          flattened.push({
            id: cert.id || item.id,
            kategori: item.categoryKey || 'Lainnya',
            sisaHari: calcDiff(dateVal),
            workflowStatus: getWfStatus(cert.status || item.status, cert.status === 'EXEMPT' ? 'EXEMPT' : item.documentStatus || 'EXEMPT'),
          });
        });
      }
    }
  });

  console.log('Total flattened:', flattened.length);
  const threshold = 30;
  
  const filteredItems = flattened;
  
  const expired = filteredItems.filter(c => c.sisaHari !== null && c.sisaHari <= 0 && c.workflowStatus !== 'decommissioned').length;
  const urgent = filteredItems.filter(c => c.sisaHari !== null && c.sisaHari > 0 && c.sisaHari <= threshold && c.workflowStatus !== 'decommissioned').length;
  const valid = filteredItems.filter(c => (c.sisaHari === null || c.sisaHari > threshold) && c.workflowStatus !== 'decommissioned' && c.workflowStatus !== 'exempt').length;

  const decommissioned = filteredItems.filter(c => c.workflowStatus === 'decommissioned').length;
  const exempt = filteredItems.filter(c => c.workflowStatus === 'exempt').length;
  
  console.log({ expired, urgent, valid, decommissioned, exempt });
  console.log('Sample item:', flattened[0]);
}
test();
