const otplib = require("otplib");
const Parse = require('parse/node');
const crypto = require("crypto");

const {
    authenticator
} = otplib;
const secretPassword = '095FCF7A-6DD0-414E-AE9F-C674A4260E83';

authenticator.options = {
    digits: 6,
    step: 90,
};

Parse.initialize("bazR4ephfMPX19qnBQyLWIQ9LmK6B2eUKBJbrh4t", "xnNw0OATIbl41ZjKTzvQwfbX2OdYtZ73xvBd3AJA", "iNPhm0s4Vj9Qbe5OIgY9885wcc7qdLdXqk4f9pnd");
Parse.serverURL = 'https://parseapi.back4app.com/';

exports.handler = async (event, context) => {
    // console.log(event);
    const method = event.httpMethod;
    const phone = event.queryStringParameters.phone;
    const token = event.queryStringParameters.code;

    if (method == 'GET') {
        if (!phone) {
            return {
                statusCode: 404,
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    error: `Phone required`
                }),
            }
        }
    }

    if (method == 'POST') {
        if (!token) {
            return {
                statusCode: 404,
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    error: `OTP code required`
                }),
            }
        }
    }

    const query = new Parse.Query(Parse.User);
    query.equalTo("username", phone);
    const existingUser = await query.first({
        useMasterKey: true
    });

    var secret;
    if (existingUser != undefined) {
        secret = existingUser.get('secret');
    }

    if (method == 'GET') {
        // console.log(`options=${authenticator.options}`);
        if (existingUser == undefined) {
            secret = authenticator.generateSecret();
            const password = crypto.createHmac('sha256', secretPassword)
                .update(secret)
                .digest('hex');

            const user = new Parse.User();
            user.set("username", phone);
            user.set("password", password);
            user.set("secret", secret);

            try {
                await user.signUp(null, {
                    useMasterKey: true
                });
            } catch (error) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: error.code,
                        message: error.message
                    }),
                };
            }
        }

        const token = authenticator.generate(secret);
        // TODO: send token via email
        console.log(`token=${token}`);

        const service = 'OTP-System';
        const otpAuth = authenticator.keyuri(phone, service, secret);
        return {
            statusCode: 200,
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                secret: secret,
                otpAuth: otpAuth,
                timeRemaining: authenticator.timeRemaining(),
                timeRemainingUnit: 'second'
            }),
        }
    }

    if (secret == undefined) {
        return {
            statusCode: 400,
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                error: 'User not found'
            }),
        };
    }

    if (method == 'POST') {
        try {
            const isValid = authenticator.check(token, secret);
            if (isValid) {
                const password = crypto.createHmac('sha256', secretPassword)
                    .update(secret)
                    .digest('hex');
                try {
                    const user = await Parse.User.logIn(phone, password);
                    if (user.get('verified') != true) {
                        user.save({
                            'verified': true
                        }, {
                            useMasterKey: true
                        }).then(function (user) {
                            console.log('User verified');
                        });
                    }

                    const json = user.toJSON();
                    delete json.ACL;
                    delete json.secret;
                    return {
                        statusCode: 200,
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(json),
                    };
                } catch (error) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            code: error.code,
                            message: error.message
                        }),
                    };
                }
            }
            return {
                statusCode: 200,
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'Invalid otp code'
                }),
            }
        } catch (err) {
            return {
                statusCode: 400,
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    error: String(err)
                }),
            };
        }

    }

    return {
        statusCode: 404,
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            error: `Unknown method ${method}`
        }),
    };
};