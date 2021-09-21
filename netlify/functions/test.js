const fetch = require("node-fetch");

const API_ENDPOINT = "https://icanhazdadjoke.com/";

exports.handler = async (event, context) => {

    return {
        statusCode: 200,
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(event),
    };
};