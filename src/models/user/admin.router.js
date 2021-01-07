import { Router } from 'express'
import controllers from './admin.controllers'
import { role } from './admin.middlewares'

const router = Router()

router.put('/changeUser/:id', role('master'), controllers.changeUser)
router.get('/listUsers', role('admin', 'master'), controllers.getAllUsers)

export default router
