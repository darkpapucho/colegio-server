"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = require("./middleware/cors");
const user_1 = require("./routes/user");
const alumno_1 = require("./routes/alumno");
const PORT = process.env.PORT || 4000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('*', cors_1.cors);
app.use('/user', user_1.userRouter);
app.use('/alumno', alumno_1.alumnoRouter);
app.listen(PORT, () => {
    console.log(`server is running up in ${PORT}`);
});
