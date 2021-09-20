const fetch = require("node-fetch");

const API_ENDPOINT = "https://icanhazdadjoke.com/";

exports.handler = async (event, context) => {
  // console.log(event);

  var path = event.path.replace('/.netlify/functions/parse/', '');
  path = `https://parseapi.back4app.com/${path}`;

  const body = event.body;
  const headers = {}
  for (const [key, value] of Object.entries(event.headers)) {
    if (key.startsWith('x-parse') || key == 'content-type') {
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
      options = {
        method: method,
        headers: headers,
        body: body
      }
    }
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
    console.log(error)
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