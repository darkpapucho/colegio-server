"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = require("./middleware/cors");
const user_1 = require("./routes/user");
const alumno_1 = require("./routes/alumno");
const documento_1 = require("./routes/documento");
const errors_1 = require("./error/errors");
const empleado_1 = require("./routes/empleado");
const calendario_1 = require("./routes/calendario");
const pension_1 = require("./routes/pension");
const anotacionesRelevantes_1 = require("./routes/anotacionesRelevantes");
const pagos_1 = require("./routes/pagos");
const PORT = process.env.PORT || 4000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors_1.cors);
app.use('/user', user_1.userRouter);
app.use('/alumno', alumno_1.alumnoRouter);
app.use('/documento', documento_1.documentoRouter);
app.use('/empleado', empleado_1.empleadoRouter);
app.use('/calendario', calendario_1.calendarioRouter);
app.use('/pensiones', pension_1.pensionRouter);
app.use('/anotaciones-relevantes', anotacionesRelevantes_1.anotacionesRelevantesRouter);
app.use('/pagos', pagos_1.pagosRouter);
app.use((err, _req, res, _next) => {
    console.log('error catched');
    console.log({ err });
    (0, errors_1.errorResponseHandler)(res, err);
});
app.listen(PORT, () => {
    console.log(`jesus nazareno server is listening`);
});
