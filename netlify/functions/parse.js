const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  // console.log(event);

  var path = event.path.replace('/.netlify/functions/parse/', '');
  path = `https://parseapi.back4app.com/${path}`;

  const body = event.body;
  const isBase64Encoded = event.isBase64Encoded;
  const headers = {}
  for (const [key, value] of Object.entries(event.headers)) {
    if (key.startsWith('x-parse') || key.startsWith('content')) {
      headers[key] = value;
    }
  }
  const method = event.httpMethod;

  try {
    var options = {
      method: method,
      headers: headers,
    }

    if (method == 'POST' || method == 'PUT') {
      if (isBase64Encoded) {
        options = {
          method: method,
          headers: headers,
          body: Buffer.from(body, 'base64'),
        }
      } else {
        options = {
          method: method,
          headers: headers,
          body: body
        }
      }
    }
    // console.log(options);
    var response = await fetch(path, options);
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    // console.log(error)
    return {
      statusCode: 422,
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        'error': String(error)
      })
    };
  }
};