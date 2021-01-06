import mongoose from 'mongoose'
import options from '../config'

export const connect = ({ url = options.dbUrl, opts = {} }) => {
  console.log('connecting to database')
  return mongoose.connect(url, { ...opts })
}
