import { User } from './user.model'
import createError from 'http-errors'

const role = (...roles) => async (req, res, next) => {
  const { user } = req

  if (!user) {
    return next(createError(401, 'User not found!'))
  }

  const userModel = await User.findById(user.id).select('role status').lean()

  if (userModel.status !== 'active') {
    return next(createError(401, 'User not active!'))
  }

  const isValid = roles.includes(userModel.role)

  if (!isValid) {
    return next(createError(401, 'User not valid!'))
  }

  next()
}

export { role }
