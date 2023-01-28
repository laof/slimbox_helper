const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const org = 'https://lncn.org';

exports.handler = async (event, context) => {
  // 进行解码
  const bs = await getssr();

  return {
    statusCode: 200,
    body: JSON.stringify(bs),
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

  const context = browser.defaultBrowserContext();
  context.overridePermissions(org, ['clipboard-read']);

  const page = await browser.newPage();

  return { browser, page };
}

async function getssr() {
  let data = [];
  const { page, browser } = await createBrowserContext();
  try {
    await page.goto(org);
    const txt = await page.evaluate(async () => {
      document.querySelector('.ssr-btn-bar button').click();
      return navigator.clipboard.readText().then((txt) => txt);
    });
    data = txt.split('\n');
  } catch (e) {}
  await browser.close();
  return data;
}
