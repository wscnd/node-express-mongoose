import createError from 'http-errors'
import { Types } from 'mongoose'

export const getOne = (model) => async (req, res, next) => {
  try {
    let keyToSearch

    if (Types.ObjectId.isValid(req.params.id)) {
      keyToSearch = '_id'
    } else {
      keyToSearch = 'name'
    }
    const doc = await model
      .findOne({ createdBy: req.user._id, [keyToSearch]: req.params.id })
      .lean()
      .exec()

    if (!doc) {
      throw new Error('Not Found!')
    }

    res.status(200).json({ data: doc })
  } catch (err) {
    return next(createError(400, err.message))
  }
}

export const getMany = (model) => async (req, res, next) => {
  try {
    const docs = await model.find({ createdBy: req.user._id }).lean().exec()

    res.status(200).json({ data: docs })
  } catch (err) {
    return next(createError(400, err.message))
  }
}

export const createOne = (model) => async (req, res, next) => {
  const createdBy = req.user._id
  try {
    const doc = await model.create({ ...req.body, createdBy })
    res.status(201).json({ data: doc })
  } catch (err) {
    return next(createError(400, err.message))
  }
}

export const updateOne = (model) => async (req, res, next) => {
  try {
    let keyToSearch

    if (Types.ObjectId.isValid(req.params.id)) {
      keyToSearch = '_id'
    } else {
      keyToSearch = 'name'
    }

    const updatedDoc = await model
      .findOneAndUpdate(
        {
          createdBy: req.user._id,
          [keyToSearch]: req.params.id,
        },
        req.body,
        { new: true, runValidators: true },
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      return next(createError(400, 'Not Found!'))
    }

    res.status(200).json({ data: updatedDoc })
  } catch (err) {
    return next(createError(400, err))
  }
}

export const removeOne = (model) => async (req, res, next) => {
  try {
    let keyToSearch

    if (Types.ObjectId.isValid(req.params.id)) {
      keyToSearch = '_id'
    } else {
      keyToSearch = 'name'
    }

    const removed = await model.findOneAndRemove({
      createdBy: req.user._id,
      [keyToSearch]: req.params.id,
    })

    if (!removed) {
      return next(createError(400, 'Not Found!'))
    }

    return res.status(200).json({ data: removed })
  } catch (err) {
    return next(createError(400, err.message))
  }
}

export const crudControllers = (model, customControllers = {}) => ({
  getOne: getOne(model),
  getMany: getMany(model),
  removeOne: removeOne(model),
  updateOne: updateOne(model),
  createOne: createOne(model),
  ...customControllers,
})
