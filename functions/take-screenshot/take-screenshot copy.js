const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

const demo =
  "https://downloader.disk.yandex.ru/disk/35684361fe4fcd8045e7ae9f9ef43b8358b27b97fe2ae06a7d178b202a8d5b3a/6353e2b3/Arlo4ikbYaCSRCfmCwxQEWG7oCVBTRMUPqKBChuzih1mSJ-ITMr4s9ZlPJSFUMKAPE_jKCkuxrBxAsvQccy56A%3D%3D?uid=0&filename=sbx_x96_x4_pro_1000mb_aosp_16_4_6.7z&disposition=attachment&hash=X7RmxaQDlo32xE7MgGwez/250YHfgd2XGtuj4kLZA/q0ro%2B8lE56dyOEu6s%2Bccl/q/J6bpmRyOJonT3VoXnDag%3D%3D%3A/sbx_x96_x4_pro_1000mb_aosp_16_4_6.7z&limit=0&content_type=application%2Fx-7z-compressed&owner_uid=40520828&fsize=755127679&hid=732dfaae3bd762b88c242ed7e4a300b4&media_type=compressed&tknv=v2";

exports.handler = async (event, context) => {
  // const pageToScreenshot = JSON.parse(event.body).pageToScreenshot;

  // if (!pageToScreenshot)
  //   return {
  //     statusCode: 400,
  //     body: JSON.stringify({ message: "Page URL not defined" }),
  //   };

  const browser = await puppeteer.launch({
    // Required
    executablePath: await chromium.executablePath,

    // Optional
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto(new URL(demo).origin);

  // const links = await page.evaluate(async (download) => {
  //   return fetch(download).then((res) => res.url);
  // }, demo);

  // await page.goto(pageToScreenshot, { waitUntil: "domcontentloaded" });

  // const screenshot = await page.screenshot({ encoding: "binary" });

  // clip here

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `ok`,
      demo: demo,
      buffer: "links",
    }),
  };
};
