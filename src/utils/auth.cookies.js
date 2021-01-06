import { User } from '../models/user/user.model'
import { newToken, verifyToken } from './auth'
import createError from 'http-errors'
const jwtDecode = require('jwt-decode')

export const signupWithCookie = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const user = new User({ email, password })
    await user.save()
    const token = newToken(user)
    res.cookie('token', token, { httpOnly: true })
    return res.status(201).send({ token })
  } catch (err) {
    return next(createError(400, err.message))
  }
}

export const signinWithCookie = async (req, res, next) => {
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
    res.cookie('token', token, { httpOnly: true })
    return res.status(200).send({ token })
  } catch (err) {
    return next(createError(401, `Wrong user or password`))
  }
}

export const protectCookie = async (req, res, next) => {
  try {
    const { token } = req.cookies || ' '

    if (!token) {
      return next(createError(401, 'You must be logged in.'))
    }

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
