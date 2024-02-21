"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const users_1 = require("../controllers/users");
// import { verifyCredentials } from '../middleware/verifyCredentials'
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post('/login', users_1.UserControllers.login);
exports.userRouter.get('/verify', users_1.UserControllers.verify);
