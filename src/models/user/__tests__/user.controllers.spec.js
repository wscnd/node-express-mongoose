import controllers from '../user.controllers'
import { isFunction } from 'lodash'

describe('user controllers', () => {
  test('has crud controllers', () => {
    const crudMethods = [
      'getOne',
      'getMany',
      'createOne',
      'removeOne',
      'updateOne',
      'me',
      'updateMe',
    ]

    crudMethods.forEach((name) =>
      expect(isFunction(controllers[name])).toBe(true),
    )
  })
})
