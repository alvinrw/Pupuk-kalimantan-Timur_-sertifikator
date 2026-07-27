const fs = require('fs');
const http = require('http');

const dummyPdfContent = Buffer.from('%PDF-1.4 dummy pdf content for testing upload');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let body = '';
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="file"; filename="test_doc.pdf"\r\n`;
body += `Content-Type: application/pdf\r\n\r\n`;
body += dummyPdfContent.toString('binary');
body += `\r\n--${boundary}--\r\n`;

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/document-history/upload',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(body, 'binary')
  }
}, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', responseData);
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err);
});

req.write(body, 'binary');
req.end();
