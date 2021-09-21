const fetch = require("node-fetch");

exports.handler = async (event, context) => {

    return {
        statusCode: 200,
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(event),
    };
};