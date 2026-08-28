import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('NETWORK ERROR:', request.url(), request.failure().errorText));
  
  try {
    await page.goto('http://localhost:5173/perizinan-aset', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
  } catch(e) {
    console.log("Error loading page:", e);
  }
  
  await browser.close();
})();
