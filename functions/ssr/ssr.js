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
    data.push('goto');
    await page.goto(org);
    data.push('evaluate');
    const txt = await page.evaluate(async (list) => {
      list.push('click');
      document.querySelector('.ssr-btn-bar button').click();
      list.push('readText');
      const aaa = await navigator.clipboard.readText();
      list.push(aaa);
      return list;
    }, data);
    data = txt.length || data;
  } catch (e) {
    data = [e.toString(), 'err'];
  }
  await browser.close();
  return data;
}
