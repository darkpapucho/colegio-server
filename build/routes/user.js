"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const users_1 = require("../controllers/users");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
// import { verifyCredentials } from '../middleware/verifyCredentials'
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post('/login', users_1.UserControllers.login);
exports.userRouter.post('/login-profesor', users_1.UserControllers.loginProfesor);
exports.userRouter.get('/verify', users_1.UserControllers.verify);
exports.userRouter.post('/reset-profesor-password', verifyCredentials_1.verifyCredentials, users_1.UserControllers.resetProfesorPassword);
