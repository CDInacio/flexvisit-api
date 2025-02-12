"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post('/signup', user_controller_1.signup);
exports.userRouter.post('/signin', user_controller_1.signin);
exports.userRouter.get('/getUser/', auth_1.isAuth, user_controller_1.getUser);
exports.userRouter.delete('/delete/:id', auth_1.isAuth, auth_1.isAdmin, user_controller_1.deleteUser);
exports.userRouter.get('/getAll', user_controller_1.getAllUsers);
exports.userRouter.put('/updateUserImg/:id', auth_1.isAuth, upload_1.upload.single('image'), user_controller_1.updateUserImg);
exports.userRouter.put('/updateUser/:id', auth_1.isAuth, user_controller_1.updateUser);
exports.userRouter.get('/userDetails/:id', auth_1.isAuth, user_controller_1.getUserDetails);
exports.userRouter.put('/updateUser/:id', auth_1.isAuth, user_controller_1.updateUser);
exports.userRouter.post('/refresh-token', user_controller_1.refreshAccessToken);
