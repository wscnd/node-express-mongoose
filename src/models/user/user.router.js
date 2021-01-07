import { Router } from 'express'
import controllers from './user.controllers'

const router = Router()

router.get('/', controllers.me)
router.put('/', controllers.updateMe)

export default router
