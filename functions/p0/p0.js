const fetch = require('node-fetch');
const CryptoJS = require('crypto-js');

const org = 'https://ln' + 'cn.org';

exports.handler = async (event, context) => {
  const list = await getdata();

  return {
    statusCode: 200,
    body: JSON.stringify(list),
  };
};

function getssr() {
  return fetch(org + '/api/ssr-list/', {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'sec-ch-ua':
        '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      cookie:
        '__cf_bm=lSoS1LwIz3Z_idgK0f.GT_1Ie7O1_z9klIDZPY3C_vU-1646228637-0-AWs+iOcxCAfYaCh3yHFCUk4HsbEbxdPwzq3JBs3D9mtWSJVmUF4ccG93EQx81xCKEfQgEGjYcH4MT8aSGYU7zCmpRzoMgsFdsGjGerAhuZ9u9CL80dq8SM2RNsaAJiXBCg==',
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
  })
    .then((res) => res.text())
    .then((res) => res);
}

function h(t, e) {
  let r = CryptoJS.enc.Utf8.parse(e);
  var n = CryptoJS.AES.decrypt(t, r, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(n).toString();
}

async function getdata() {
  const list = [];
  try {
    const str = await getssr();
    if (!str) {
      return [];
    }

    const data = JSON.parse(str);
    const ssrs = data.ssrs.split('2022');
    const ssr = h(ssrs[0], Buffer.from(ssrs[1], 'base64').toString());
    const json = JSON.parse(ssr.replaceAll('\n', ''));
    json.forEach((obj) => {
      list.push(obj.url);
    });
    return list;
  } catch (e) {
    // console.log(e);
    return [];
  }
}

async function test() {
  const list = await getdata();
  console.log(list);
}

// test();
