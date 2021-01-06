import { expect } from '@jest/globals'
import mongoose from 'mongoose'
import { List } from '../../models/list/list.model'
import { createOne, getMany, getOne, removeOne, updateOne } from '../crud'
import errorHandler from '../errors'
import CreateError from 'http-errors'

describe('crud controllers', () => {
  describe('getOne', () => {
    test('finds by authenticated user and id', async () => {
      expect.assertions(3)

      const user = mongoose.Types.ObjectId()
      const list = await List.create({ name: 'list', createdBy: user })

      const req = {
        params: {
          id: list._id,
        },
        user: {
          _id: user,
        },
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(result) {
          expect(result.data._id.toString()).toBe(list._id.toString())
        },
      }

      const next = jest.fn()
      expect(next).not.toHaveBeenCalled()

      await getOne(List)(req, res, next)
    })

    test('400 if no doc was found', async () => {
      expect.assertions(5)

      const user = mongoose.Types.ObjectId()

      const req = {
        params: {
          id: mongoose.Types.ObjectId(),
        },
        user: {
          _id: user,
        },
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(message) {
          expect(message).toBe(JSON.stringify({ message: error.message }))
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(400, 'Not Found!')

      await getOne(List)(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })
  })

  describe('getMany', () => {
    test('finds array of docs by authenticated user', async () => {
      expect.assertions(5)

      const user = mongoose.Types.ObjectId()
      await List.create([
        { name: 'list', createdBy: user },
        { name: 'other', createdBy: user },
        { name: 'list', createdBy: mongoose.Types.ObjectId() },
      ])

      const req = {
        user: {
          _id: user,
        },
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(result) {
          expect(result.data).toHaveLength(2)
          result.data.forEach((doc) =>
            expect(`${doc.createdBy}`).toBe(`${user}`),
          )
        },
      }

      const next = jest.fn()

      await getMany(List)(req, res, next)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('createOne', () => {
    test('creates a new doc', async () => {
      expect.assertions(3)

      const user = mongoose.Types.ObjectId()
      const body = { name: 'name' }

      const req = {
        user: { _id: user },
        body,
      }

      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        json(results) {
          expect(results.data.name).toBe(body.name)
        },
      }

      const next = jest.fn()

      await createOne(List)(req, res, next)
      expect(next).not.toHaveBeenCalled()
    })

    test('createdBy should be the authenticated user', async () => {
      expect.assertions(3)

      const user = mongoose.Types.ObjectId()
      const body = { name: 'name' }

      const req = {
        user: { _id: user },
        body,
      }

      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        json(results) {
          expect(`${results.data.createdBy}`).toBe(`${user}`)
        },
      }

      const next = jest.fn()

      await createOne(List)(req, res, next)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('updateOne', () => {
    test('finds doc by authenticated user and id to update', async () => {
      expect.assertions(4)

      const user = mongoose.Types.ObjectId()
      const list = await List.create({ name: 'name', createdBy: user })
      const update = { name: 'hello' }

      const req = {
        params: { id: list._id },
        user: { _id: user },
        body: update,
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(results) {
          expect(`${results.data._id}`).toBe(`${list._id}`)
          expect(results.data.name).toBe(update.name)
        },
      }
      const next = jest.fn()

      await updateOne(List)(req, res, next)
      expect(next).not.toHaveBeenCalled()
    })

    test('400 if no doc', async () => {
      // expect.assertions(5)

      const user = mongoose.Types.ObjectId()
      const update = { name: 'hello' }

      const req = {
        params: { id: mongoose.Types.ObjectId() },
        user: { _id: user },
        body: update,
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(message) {
          expect(message).toBe(JSON.stringify({ message: error.message }))
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = CreateError(400, 'Not Found!')

      await updateOne(List)(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })
  })

  describe('removeOne', () => {
    test('first doc by authenticated user and id to remove', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const list = await List.create({ name: 'name', createdBy: user })

      const req = {
        params: { id: list._id },
        user: { _id: user },
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(results) {
          expect(`${results.data._id}`).toBe(`${list._id}`)
        },
      }
      const next = jest.fn()

      await removeOne(List)(req, res, next)
    })

    test('400 if no doc', async () => {
      expect.assertions(5)
      const user = mongoose.Types.ObjectId()

      const req = {
        params: { id: mongoose.Types.ObjectId() },
        user: { _id: user },
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(message) {
          expect(message).toBe(JSON.stringify({ message: error.message }))
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(400, 'Not Found!')

      await removeOne(List)(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })
  })
})
