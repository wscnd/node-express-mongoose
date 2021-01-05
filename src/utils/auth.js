import config from '../config'
import { User } from '../models/user/user.model'
import jwt from 'jsonwebtoken'

export const newToken = (user) => {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp,
  })
}

export const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const signup = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = new User({ email, password })
    await user.save()
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (err) {
    return res.status(400).send({ message: err.message })
  }
}

export const signin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).send({ message: 'Requires email and password' })
  }

  const user = await User.findOne({ email }).exec()

  if (!user) {
    return res.status(401).send({ message: 'Invalid email and password' })
  }

  try {
    await user.checkPassword(password)
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (err) {
    return res
      .status(401)
      .send({ message: `Wrong user or password ${err.message}` })
  }
}

export const protect = async (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).send({ message: 'You must be logged in.' })
  }

  const token = authorization.split('Bearer ')[1]

  try {
    const verification = await verifyToken(token)

    const user = await User.findById(verification.id)
      .select('-password')
      .lean()
      .exec()

    if (!user) {
      return res.status(401).send({ message: 'Invalid User' })
    }

    req.user = user
  } catch (err) {
    return res.status(401).send({ message: 'Invalid User' })
  }

  next()
}
