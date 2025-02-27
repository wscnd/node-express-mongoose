import express from 'express'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import config from '../config'
import cors from 'cors'
import { connect } from '../utils/db'
import userRouter from '../models/user/user.router'
import adminRouter from '../models/user/admin.router'
import itemRouter from '../models/item/item.router'
import listRouter from '../models/list/list.router'
// import { signup, signin, protect } from '../utils/auth'
import {
  signupWithCookie,
  signinWithCookie,
  protectCookie,
} from '../utils/auth.cookies'
import error from '../utils/errors'
import helmet from 'helmet'
import getDebugger from 'debug'
import cookieParser from 'cookie-parser'

export const app = express()
const debug = getDebugger('app')

app.use(cookieParser())
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(helmet())

// app.use('/api/signin', signin)
// app.use('/api/signup', signup)
// app.use(protect)

app.use('/api/users', signupWithCookie)
app.use('/api/authenticate', signinWithCookie)

app.use(protectCookie)
app.use('/api/userprofile', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/list', listRouter)
app.use('/api/item', itemRouter)
app.use(error)

function onListening() {
  const addr = app.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  debug('Listening on port' + bind)
}

export const start = async () => {
  try {
    await connect({
      opts: {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    })
    app.listen(config.port, () => {
      console.log(`REST API on http://localhost:${config.port}/`)
    })
    app.on('listening', onListening)
  } catch (e) {
    console.error(e)
  }
}
