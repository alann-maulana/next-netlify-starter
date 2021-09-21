const fetch = require("node-fetch");

exports.handler = async (event, context) => {
    try {
        var response = await fetch('https://epic-knuth-c367a7.netlify.app/.netlify/functions/test?username=password');
        const data = await response.json();
        return {
            statusCode: 200,
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
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