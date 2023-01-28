const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const org = 'https://ln' + 'cn.org';

exports.handler = async (event, context) => {
  const list = await getssr();
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify([]),
  };
};

async function createBrowserContext() {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  // const context = await browser.defaultBrowserContext();
  // context.overridePermissions(org, ['clipboard-read', 'clipboard-write']);

  const page = await browser.newPage();

  return { browser, page };
}

async function getssr() {
  const { browser, page } = await createBrowserContext();

  await page.goto(org + '/api/ssr-list');

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  await page.waitForSelector('body');

  const fullTitle = await page.evaluate(
    () => document.querySelector('body').innerHTML
  );

  // Print the full title
  console.log(fullTitle);

  await browser.close();

  return fullTitle;
}
