import config from '../config'
import { User } from '../models/user/user.model'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
const jwtDecode = require('jwt-decode')

export const newToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, iss: 'api.wscnd', aud: 'api.wscnd' },
    config.secrets.jwt,
    {
      expiresIn: config.secrets.jwtExp,
    },
  )
}

export const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const signup = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const user = new User({ email, password })
    await user.save()
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (err) {
    return next(createError(400, err.message))
  }
}

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return next(createError(400, 'Requires email and password'))
    }

    const user = await User.findOne({ email }).exec()

    if (!user) {
      return next(createError(401, 'Invalid email and password'))
    }

    await user.checkPassword(password)

    const token = newToken(user)
    const decodedToken = jwtDecode(token)

    console.log('decodedToken:', decodedToken)
    return res.status(200).send({ token })
  } catch (err) {
    return next(createError(401, `Wrong user or password`))
  }
}

export const protect = async (req, res, next) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      return next(createError(401, 'You must be logged in.'))
    }

    const token = authorization.slice('Bearer '.length)

    const verification = await verifyToken(token)

    const user = await User.findById(verification.id)
      .select('-password')
      .lean()
      .exec()

    if (!user) {
      return next(createError(401, 'Invalid User'))
    }

    req.user = user
  } catch (err) {
    return next(createError(401, 'Invalid User'))
  }

  next()
}

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'There was a problem authorizing the request',
    })
  }
  if (req.user.role !== 'admin') {
    return res.status(401).json({ message: 'Insufficient role' })
  }
  next()
}
