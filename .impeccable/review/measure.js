const puppeteer = require('/tmp/node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--user-data-dir=C:/temp-edge-cdp1'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  const data = await page.evaluate(() => {
    function rect(sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        sel,
        width: r.width,
        x: r.x,
        right: r.right,
        scrollWidth: el.scrollWidth,
        cssWidth: cs.width,
        display: cs.display,
        whiteSpace: cs.whiteSpace,
        maxWidth: cs.maxWidth,
      };
    }
    return {
      docScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      innerWidth: window.innerWidth,
      board: rect('.board'),
      boardMain: rect('.board-main'),
      seam: rect('.seam'),
      introDiv: rect('.seam > div'),
      h1: rect('h1'),
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
