import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'complete', 'pastdue'],
      default: 'active',
    },
    notes: String,
    due: Date,
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    list: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'list',
      required: [true, 'List Required!'],
    },
  },
  { timestamps: true },
)

itemSchema.index({ list: 1, name: 1 }, { unique: true })

itemSchema.pre('findOneAndUpdate', function (next, data) {
  console.log('findOneAndUpdate')
  console.log(this._update)
  next()
})

export const Item = mongoose.model('item', itemSchema)
