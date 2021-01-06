import { merge } from 'lodash'
require('dotenv-flow').config()

const env = process.env.NODE_ENV
const baseConfig = {
  env,
  isDev: env === 'development',
  isTest: env === 'testing',
  port: process.env.PORT,
  secrets: {
    jwt: process.env.JWT_SECRET,
    jwtExp: '1h',
  },
  dbUrl: process.env.MONGODB_URI,
}

let envConfig = {}

switch (env) {
  case 'dev':
  case 'development':
    envConfig = require('./dev').config
    break
  case 'test':
  case 'testing':
    envConfig = require('./testing').config
    break
  default:
    envConfig = require('./dev').config
}

export default merge(baseConfig, envConfig)
