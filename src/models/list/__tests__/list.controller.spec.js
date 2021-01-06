import { expect } from '@jest/globals'
import controllers from '../list.controllers'
import { isFunction } from 'lodash'
import mongoose from 'mongoose'
import { List } from '../list.model'

describe('list controllers', () => {
  const { getOne, getMany, createOne, removeOne, updateOne } = controllers

  describe('getOne', () => {
    test('has crud controllers', () => {
      const crudMethods = [getOne, getMany, createOne, removeOne, updateOne]

      crudMethods.forEach((name) => expect(isFunction(name)).toBe(true))
    })

    test('finds by list name', async () => {
      expect.assertions(3)

      const user = mongoose.Types.ObjectId()
      const list = await List.create({ name: 'list', createdBy: user })

      const req = {
        params: {
          id: list.name,
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

      await getOne(req, res, next)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
