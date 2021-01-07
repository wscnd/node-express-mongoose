import { User } from './user.model'
import createError from 'http-errors'
import { crudControllers } from '../../utils/crud'

const me = (req, res) => {
  return res.status(200).json({ data: req.user })
}

const updateMe = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec()
    return res.status(200).json({ data: user })
  } catch (err) {
    return next(createError(400, err.message))
  }
}

const customControllers = {
  me,
  updateMe,
}

export default crudControllers(User, { ...customControllers })
