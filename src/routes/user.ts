import { Router } from 'express'
import { UserControllers } from '../controllers/users'
// import { verifyCredentials } from '../middleware/verifyCredentials'

export const userRouter = Router()

userRouter.post('/login', UserControllers.login)
userRouter.post('/login-profesor', UserControllers.loginProfesor)
userRouter.get('/verify', UserControllers.verify)
