window.test = function () {
  const link = document.getElementById('data').value;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ downloader: link }),
  };

  fetch('/.netlify/functions/take-screenshot', options)
    .then((res) => res.json())
    .then((res) => {});
};

window.lova = function () {
  const postData = {
    eby5a: window.btoa(document.getElementById('data').value),
  };

  var form = document.createElement('form');
  form.action = '/.netlify/functions/form';
  form.method = 'post';
  form.style.display = 'none';

  for (const key in postData) {
    var input = document.createElement('textarea');
    input.name = key;
    input.value = postData[key];
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  return form;
};

window.lova1 = function () {
  const postData = {
    method: 'POST',
    // headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ disk: document.getElementById('data').value }),
  };

  fetch('/.netlify/functions/p3', postData)
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
    });
};
