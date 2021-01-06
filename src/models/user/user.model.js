import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          // eslint-disable-next-line
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v)
        },
        message: 'Please enter a valid email',
      },
    },
    password: {
      type: String,
      required: true,
    },
    settings: {
      theme: {
        type: String,
        required: true,
        default: 'dark',
      },
      notifications: {
        type: Boolean,
        required: true,
        default: true,
      },
      compactMode: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true },
)

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  console.log('asdasdasd')

  bcrypt.hash(this.password, 8, (err, hash) => {
    if (err) {
      return next(err)
    }

    this.password = hash
    next()
  })
})

userSchema.methods.checkPassword = function (password) {
  const passwordHash = this.password
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) {
        return reject(err)
      }

      if (!same) {
        return reject(same)
      }

      resolve(same)
    })
  })
}

export const User = mongoose.model('user', userSchema)
