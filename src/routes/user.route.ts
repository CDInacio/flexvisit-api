import { Router } from 'express'
import {
  deleteUser,
  getAllUsers,
  getUser,
  getUserDetails,
  refreshAccessToken,
  signin,
  signup,
  updateUser,
  updateUserImg,
} from '../controllers/user.controller'
import { isAdmin, isAuth } from '../middlewares/auth'
import { upload } from '../middlewares/upload'

export const userRouter = Router()

userRouter.post('/signup', signup)
userRouter.post('/signin', signin)
userRouter.get('/getUser/', isAuth, getUser)
userRouter.delete('/delete/:id', isAuth, isAdmin, deleteUser)
userRouter.get('/getAll', getAllUsers)

userRouter.put(
  '/updateUserImg/:id',
  isAuth,
  upload.single('image'),
  updateUserImg,
)
userRouter.put('/updateUser/:id', isAuth, updateUser)
userRouter.get('/userDetails/:id', isAuth, getUserDetails)
userRouter.put('/updateUser/:id', isAuth, updateUser)
userRouter.post('/refresh-token', refreshAccessToken)