import { Router } from 'express'
import { UserControllers } from '../controllers/users'
import { verifyCredentials } from '../middleware/verifyCredentials'
// import { verifyCredentials } from '../middleware/verifyCredentials'

export const userRouter = Router()

userRouter.post('/login', UserControllers.login)
userRouter.post('/login-client', UserControllers.loginClient)
userRouter.get('/verify', UserControllers.verify)
userRouter.post('/reset-profesor-password', verifyCredentials, UserControllers.resetProfesorPassword)
