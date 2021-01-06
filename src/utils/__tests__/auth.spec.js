import { newToken, verifyToken, signup, signin, protect } from '../auth'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import config from '../../config'
import { User } from '../../models/user/user.model'
import errorHandler from '../errors'
import CreateError from 'http-errors'

describe('Authentication:', () => {
  describe('newToken', () => {
    test('creates new jwt from user', () => {
      const id = 123
      const token = newToken({ id })
      const user = jwt.verify(token, config.secrets.jwt)

      expect(user.id).toBe(id)
    })
  })

  describe('verifyToken', () => {
    test('validates jwt and returns payload', async () => {
      const id = 1234
      const token = jwt.sign({ id }, config.secrets.jwt)
      const user = await verifyToken(token)
      expect(user.id).toBe(id)
    })
  })

  describe('signup', () => {
    test('requires email and password', async () => {
      expect.assertions(5)

      const req = { body: {} }
      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(message) {
          expect(typeof message).toBe('string')
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(
        400,
        'user validation failed: email: Path `email` is required., password: Path `password` is required.',
      )

      await signup(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })

    test('creates user and and sends new token from user', async () => {
      expect.assertions(3)

      const req = { body: { email: 'hello@hello.com', password: '293jssh' } }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          let user = await verifyToken(result.token)
          user = await User.findById(user.id).lean().exec()
          expect(user.email).toBe('hello@hello.com')
        },
      }
      const next = jest.fn()
      await signup(req, res, next)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('signin', () => {
    test('requires email and password', async () => {
      expect.assertions(5)

      const req = { body: {} }
      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(message) {
          expect(typeof message).toBe('string')
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(400, 'Requires email and password')

      await signin(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })

    test('user must be real', async () => {
      expect.assertions(5)

      const req = { body: { email: 'hello@hello.com', password: '293jssh' } }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(message) {
          expect(typeof message).toBe('string')
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(401, 'Invalid email and password')
      await signin(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })

    test('passwords must match', async () => {
      expect.assertions(5)

      await User.create({
        email: 'hello@me.com',
        password: 'yoyoyo',
      })

      const req = { body: { email: 'hello@me.com', password: 'wrong' } }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(message) {
          expect(typeof message).toBe('string')
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(401, `Wrong user or password`)
      await signin(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })

    test('creates new token', async () => {
      expect.assertions(3)
      const fields = {
        email: 'hello@me.com',
        password: 'yoyoyo',
      }
      const savedUser = await User.create(fields)

      const req = { body: fields }
      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        async send(result) {
          let user = await verifyToken(result.token)
          user = await User.findById(user.id).lean().exec()
          expect(user._id.toString()).toBe(savedUser._id.toString())
        },
      }

      const next = jest.fn()

      await signin(req, res, next)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('protect', () => {
    test('looks for Bearer token in headers', async () => {
      expect.assertions(5)

      const req = { headers: {} }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(message) {
          expect(typeof message).toBe('string')
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(401, 'You must be logged in.')
      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })

    test('token must have correct prefix', async () => {
      expect.assertions(5)

      const req = { headers: { authorization: newToken({ id: '123sfkj' }) } }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(message) {
          expect(typeof message).toBe('string')
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(401, 'Invalid User')
      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })

    test('must be a real user', async () => {
      expect.assertions(5)
      const token = `Bearer ${newToken({ id: mongoose.Types.ObjectId() })}`
      const req = { headers: { authorization: token } }

      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result).toBe('string')
        },
        end() {
          expect(true).toBe(true)
        },
      }

      const next = jest.fn()
      const error = new CreateError(401, 'Invalid User')
      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      await errorHandler(error, req, res)
    })

    test('finds user form token and passes on', async () => {
      expect.assertions(3)
      const user = await User.create({
        email: 'hello@hello.com',
        password: '1234',
      })
      const token = `Bearer ${newToken(user)}`
      const req = { headers: { authorization: token } }

      const next = jest.fn()
      await protect(req, {}, next)
      expect(req.user._id.toString()).toBe(user._id.toString())
      expect(req.user).not.toHaveProperty('password')
      expect(next).toHaveBeenCalled()
    })
  })
})
