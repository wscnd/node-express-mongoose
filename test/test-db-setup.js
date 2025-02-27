import mongoose from 'mongoose'
import cuid from 'cuid'
import _ from 'lodash'
import { Item } from '../src/models/item/item.model'
import { List } from '../src/models/list/list.model'
import { User } from '../src/models/user/user.model'
import config from '../src/config'

const models = { User, List, Item }

const url = config.dbUrl

global.newId = () => {
  return mongoose.Types.ObjectId()
}

const remove = (collection) =>
  new Promise((resolve, reject) => {
    collection.deleteMany((err) => {
      if (err) return reject(err)
      resolve()
    })
  })

beforeEach(async (done) => {
  const db = cuid()
  function clearDB() {
    return Promise.all(_.map(mongoose.connection.collections, (c) => remove(c)))
  }

  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(url + db, {
        useNewUrlParser: true,
        autoIndex: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      await clearDB()
      await Promise.all(Object.keys(models).map((name) => models[name].init()))
    } catch (e) {
      console.log('connection error')
      console.error(e)
      throw e
    }
  } else {
    await clearDB()
  }
  done()
})
afterEach(async (done) => {
  await mongoose.connection.db.dropDatabase()
  await mongoose.disconnect()
  return done()
})
afterAll((done) => {
  return done()
})
