const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const org = 'https://ln' + 'cn.org';

exports.handler = async (event, context) => {
  const list = await getssr();
  return {
    statusCode: 200,
    body: JSON.stringify(list),
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
    await page.waitForSelector('.ssr-btn-bar button');
  } catch (err) {
    try {
      await browser.close();
    } catch (e) {}

    return ['fis....'];
  }

  try {
    const txt = await page.evaluate(async () => {
      document.querySelector('.ssr-btn-bar button').click();
      return await navigator.clipboard.readText();
    });
    data = [txt];
  } catch (e) {
    data = [e.toString(), 'err'];
  }
  await browser.close();
  return data;
}
