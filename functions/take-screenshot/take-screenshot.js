const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

exports.handler = async (event, context) => {
  const downloader = JSON.parse(event.body).downloader;
  let blobstorage = "";
  const today = new Date().toLocaleString("zh-cn", {
    timeZone: "Asia/Shanghai",
  });
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.goto(new URL(downloader).origin);

    blobstorage = await page.evaluate(async (link) => {
      return fetch(link).then((res) => res.url);
    }, downloader);
    await browser.close();
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        date: today,
        error: e,
      }),
    };
  }

  let success = false;
  if (
    blobstorage.startsWith("https://") &&
    new URL(blobstorage).origin != new URL(downloader).origin
  ) {
    success = true;
  } else {
    blobstorage = "";
  }

  return {
    statusCode: 200,
    headers: {
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({
      success,
      blobstorage,
      date: today,
    }),
  };
};
