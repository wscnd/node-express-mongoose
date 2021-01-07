import { Router } from 'express'
import controllers from './user.controllers'
import { role } from './user.middlewares'

const router = Router()

router.get('/', controllers.me)
router.put('/', controllers.updateMe)
router.put('/elevateMe', role('admin'), controllers.elevateMe)
router.put('/elevateUser', role('admin'), controllers.elevateUser)
router.get('/listUsers', role('admin'), controllers.getAllUsers)

export default router
