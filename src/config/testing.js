export const config = {
  secrets: {
    jwt: process.env.JWT_SECRET,
  },
  dbUrl: process.env.MONGODB_URI,
}
