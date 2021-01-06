import { User } from './user.model'

import { crudControllers } from '../../utils/crud'

const me = (req, res) => {
  return res.status(200).json({ data: req.user })
}

const updateMe = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec()
    return res.status(200).json({ data: user })
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

const customControllers = {
  me,
  updateMe,
}

export default crudControllers(User, { ...customControllers })
