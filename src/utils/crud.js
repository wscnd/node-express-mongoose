export const getOne = (model) => async (req, res, next) => {
  try {
    const doc = await model
      .findOne({ createdBy: req.user._id, _id: req.params.id })
      .lean()
      .exec()

    if (!doc) {
      throw new Error('Not Found!')
    }

    res.status(200).json({ data: doc })
  } catch (err) {
    err.status = 400
    next(err)
  }
}

export const getMany = (model) => async (req, res, next) => {
  try {
    const docs = await model.find({ createdBy: req.user._id }).lean().exec()

    res.status(200).json({ data: docs })
  } catch (err) {
    err.status = 400
    next(err)
  }
}

export const createOne = (model) => async (req, res, next) => {
  const createdBy = req.user._id
  try {
    const doc = await model.create({ ...req.body, createdBy })
    res.status(201).json({ data: doc })
  } catch (err) {
    err.status = 400
    next(err)
  }
}

export const updateOne = (model) => async (req, res, next) => {
  try {
    const updatedDoc = await model
      .findOneAndUpdate(
        {
          createdBy: req.user._id,
          _id: req.params.id,
        },
        req.body,
        { new: true },
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      throw new Error('Not Found!')
    }

    res.status(200).json({ data: updatedDoc })
  } catch (err) {
    err.status = 400
    next(err)
  }
}

export const removeOne = (model) => async (req, res, next) => {
  try {
    const removed = await model.findOneAndRemove({
      createdBy: req.user._id,
      _id: req.params.id,
    })

    if (!removed) {
      throw new Error('Not Found!')
    }

    return res.status(200).json({ data: removed })
  } catch (err) {
    err.status = 400
    next(err)
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
