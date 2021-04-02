import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import axios from 'axios'

const providers = [
    Providers.Credentials({
        name: 'Credentials',
        authorize: async (credentials) => {
            try {
                const user = await axios.post(`https://xcbz4infqk.execute-api.us-east-1.amazonaws.com/dev/login`,
                    {
                            password: credentials.password,
                            email: credentials.email
                    },
                    {
                        headers: {
                            accept: '*/*',
                            'Content-Type': 'application/json'
                        }
                    })

                console.log('user', user)
                if (user) {
                    console.log('axios user', user)
                    return {status: 'success', data: user.headers['x-bbc-token']}
                }
            } catch (e) {
                const errorMessage = e.response.data.message
                // Redirecting to the login page with error messsage in the URL
                throw new Error(errorMessage + '&email=' + credentials.email)
            }

        }
    }),
    Providers.GitHub({
        clientId: 'Iv1.exxxxxxxxxxxxxxx',//process.env.GITHUB_CLIENT_ID,
        clientSecret: 'af5bd8dbxxxxxxxxxxxxxxx',// process.env.GITHUB_CLIENT_SECRET

    })
]

const callbacks = {
    async jwt(token, user) {
        console.log('jwt')
        console.log('token', token)
        console.log('user', user)
        if (user) {
            token.accessToken = user.data
        }

        return token
    },

    async session(session, token) {
        console.log('token', token)
        console.log('session', session)
        //session.accessToken = token.accessToken
        return session
    }
}

const options = {
    providers,
    callbacks,
    pages: {
        error: '/login' // Changing the error redirect page to our custom login page

    }
}

export default (req, res) => NextAuth(req, res, options)
