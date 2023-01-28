const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

exports.handler = async (event, context) => {
  const url = JSON.parse(event.body).disk;

  // 进行解码
  const bs = await getDownloadURL(url);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://laof.github.io',
    },
    // headers: bs ? { location: bs } : {},
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

  const page = await browser.newPage();

  return { browser, page };
}

async function getDownloadURL(disk) {
  const opt = await downloader(disk);

  try {
    for (let item of opt.files) {
      const { page, browser } = await createBrowserContext();
      await page.goto(new URL(item.url).origin);
      const blobStorage = await page.evaluate(async (link) => {
        return fetch(link).then((res) => res.url);
      }, item.url);
      item.url = blobStorage;
      item.id = '';
      await browser.close();
    }
  } catch (e) {
    opt && opt.error && opt.error.push(e);
  }

  return opt;
}

async function downloader(diskLink) {
  const { page, browser } = await createBrowserContext();
  await page.goto(diskLink); // http://disk.yandex.ru/x

  // await page.setDefaultNavigationTimeout(30000)
  // await page.waitForNavigation({ timeout: 1000 * 10 })

  try {
    await page.waitForSelector('#store-prefetch'); //json data
  } catch (err) {
    try {
      await browser.close();
    } catch (e) {}

    return { error: [err], files: [] };
  }

  const fs = await page.evaluate(async () => {
    let data, resource;
    const obj = { error: [], files: [] };

    try {
      data = JSON.parse(document.getElementById('store-prefetch').innerHTML);
    } catch (e) {
      return obj.error.push('parse json data'), obj;
    }

    try {
      resource = data.resources[data.rootResourceId].children;
    } catch (e) {
      return obj.error.push('parse resource'), obj;
    }

    const filename = resource.reduce((arr, id) => {
      let item;
      try {
        item = data.resources[id];
      } catch (e) {
        return obj.error.push(`${id} parse json data`), arr;
      }

      if (item.type == 'file') {
        let body = '',
          all = '';

        try {
          body = JSON.stringify({
            hash: item.path,
            sk: data.environment.sk,
          });
          all = JSON.stringify({
            hash: data.resources[data.rootResourceId].hash,
            sk: data.environment.sk,
          });
        } catch (e) {
          return obj.error.push(`${id} set payload`), arr;
        }

        const date = Number(item.modified + '000');
        arr.push({
          id,
          name: item.name,
          size: item.meta.size,
          payload: encodeURIComponent(body),
          all: encodeURIComponent(all),
          modified: new Date(date).toLocaleString('Zh', {
            timeZone: 'Asia/Shanghai',
          }),
        });
      }
      return arr;
    }, []);

    const loader = filename.map((item) => {
      return new Promise((resolve) => {
        const payload = item.payload;
        const all = item.all;
        Reflect.deleteProperty(item, 'payload');
        Reflect.deleteProperty(item, 'all');
        const timer = setTimeout(() => resolve(null), 5 * 1000);

        fetch('https://disk.yandex.ru/public/api/download-url', {
          method: 'post',
          body: payload,
        })
          .then((res) => res.json())
          .then((res) => {
            clearTimeout(timer);
            const url = res.data.url;
            resolve(Object.assign(item, { url }));
          })
          .catch((e) => {
            clearTimeout(timer);
            obj.error.push(`${item.id} fetch download url`);
            resolve(null);
          });
      });
    });

    if (obj.error.length) {
      obj.files = [];
    } else {
      // [{name:"x96_x4.7z",url:https://downloader.disk.yandex.ru/disk/a57}]
      const f = await Promise.all(loader);
      obj.files = f.filter((o) => o);
    }

    return obj;
  });

  await browser.close();

  return fs;
}
