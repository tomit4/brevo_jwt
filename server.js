'use strict'
const Hapi = require('@hapi/hapi')
const Path = require('path')
require('dotenv').config()

// Plugins
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const plugins = [Jwt, Inert]

// Brevo logic
const sendinblue = require('./app/sendinblue')

const registerPlugins = async (server, plugins) => {
    for (const plugin of plugins) {
        await server.register(plugin)
    }
}

const validateJwt = (decodedToken, secret) => {
    const verifyToken = (artifact, secret, options = {}) => {
        try {
            Jwt.token.verify(artifact, secret, options)
            return { isValid: true }
        } catch (err) {
            return {
                isValid: false,
                error: err.message,
            }
        }
    }
    return verifyToken(decodedToken, secret).isValid
}

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: true,
            files: {
                relativeTo: Path.join(__dirname, 'public'),
            },
        },
    })
    await registerPlugins(server, plugins)

    server.route({
        method: 'GET',
        path: '/{token?}',
        handler: (request, h) => {
            console.log('request.state :=>', request.state) // empty object...
            const token = request.state.token
            if (token) {
                const decodedToken = Jwt.token.decode(token)
                const isValid = validateJwt(decodedToken, 'some_shared_secret')
                return isValid
                    ? h.redirect('/secret')
                    : h.redirect('/signup').unstate('token')
            } else {
                return h.redirect('/signup')
            }
        },
    })

    server.route({
        method: 'GET',
        path: '/signup',
        handler: (request, h) => {
            return h.file('index.html')
        },
    })

    server.route({
        method: 'GET',
        path: '/secret',
        handler: (request, h) => {
            const token = request.state.token
            if (token) {
                const decodedToken = Jwt.token.decode(token)
                const isValid = validateJwt(decodedToken, 'some_shared_secret')
                return isValid
                    ? h.file('secret.html')
                    : h.redirect('/signup').unstate('token')
            } else {
                return h.redirect('/signup')
            }
        },
    })

    server.route({
        method: 'POST',
        path: '/',
        handler: (request, h) => {
            const token = Jwt.token.generate(
                {
                    aud: 'urn:audience:test',
                    iss: 'urn:issuer:test',
                    user: 'some_user_name',
                    group: 'hapi_community',
                },
                {
                    key: 'some_shared_secret',
                    algorithm: 'HS512',
                },
                {
                    ttlSec: 300, // 5 minutes
                },
            )

            const response = h.response('success')
            response.header('token', token)
            return response
            // return h.redirect('/').state('token', token)
        },
    })

    server.route({
        method: 'POST',
        path: '/email',
        handler: (request, h) => {
            try {
                const { token } = request.payload
                const sendSmtpEmail = {
                    to: [
                        {
                            email: process.env.MY_EMAIL,
                        },
                    ],
                    templateId: 1,
                    params: {
                        link: `localhost:3000/verify/${token}`,
                    },
                }
                sendinblue(sendSmtpEmail)
                return h.response('success')
            } catch (err) {
                console.error('ERROR :=>', err)
            }
        },
    })

    server.route({
        method: 'GET',
        path: '/verify/{token?}',
        handler: (request, h) => {
            console.log('request.state :=>', request.state)
            const token = request.params.token
            if (token) {
                const decodedToken = Jwt.token.decode(token)
                const isValid = validateJwt(decodedToken, 'some_shared_secret')
                // Tried to return isValid ? h.redirect('/').state('token', token)
                // But upon arrival at GET '/', request.state is empty even
                // though cookies indeed have it as evidenced in devtools...
                //
                // Answer might lie: https://github.com/hapijs/hapi/issues/2970
                return isValid
                    ? h.file('secret.html').state('token', token)
                    : h.redirect('/signup').unstate('token')
            } else {
                return h.redirect('/signup')
            }
        },
    })

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
    console.error('ERROR :=>', err)
    process.exit(1)
})

init()