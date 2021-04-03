import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import axios from "axios"

export default NextAuth({
  pages: {
    error: "/login", // Changing the error redirect page to our custom login page
  },
  callbacks: {
    async jwt(token, _, account) {
      if (account) {
        token.accessToken = account.accessToken
      }
      return token
    },
    async session(session, token) {
      return { ...session, accessToken: token.accessToken }
    },
  },
  providers: [
    Providers.Credentials({
      name: "Credentials",
      async authorize(credentials) {
        try {
          const user = await axios.post(
            `https://xcbz4infqk.execute-api.us-east-1.amazonaws.com/dev/login`,
            credentials,
            { headers: { accept: "*/*" } }
          )
          if (user) {
            return { status: "success", data: user.headers["x-bbc-token"] }
          }
          //TODO: throw Error if user creation wasn't succesful
        } catch (e) {
          const errorMessage = e.response.data.message
          // Redirecting to the login page with error messsage in the URL
          throw new Error(errorMessage + "&email=" + credentials.email)
        }
      },
    }),
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
})
