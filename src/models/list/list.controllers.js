import { List } from './list.model'
import { crudControllers } from '../../utils/crud'
import createError from 'http-errors'

const getManyWithPage = async (req, res, next) => {
  try {
    const docs = await List.find({ createdBy: req.user._id })
      .lean()
      .limit(Number(req.query.limit))
      .exec()
    res.status(200).json({ data: docs })
  } catch (err) {
    return next(createError(400, err.message))
  }
}

const customControllers = {
  getManyWithPage,
}

export default crudControllers(List, { ...customControllers })
