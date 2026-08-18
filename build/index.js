"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const anuncios_1 = require("./routes/anuncios");
const cursos_1 = require("./routes/cursos");
const notas_1 = require("./routes/notas");
const hashPassword_1 = require("./utils/hashPassword");
const pagos_1 = require("./routes/pagos");
const asistenciaColegio_1 = require("./routes/asistenciaColegio");
// import { hashPassword } from './utils/hashPassword'
const PORT = process.env.PORT || 4000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors_1.cors);
app.get('/', (_req, res) => res.send('Colegio Jesús el Nazareno - Dist. Ancón'));
app.use('/user', user_1.userRouter);
app.use('/alumno', alumno_1.alumnoRouter);
app.use('/documento', documento_1.documentoRouter);
app.use('/empleado', empleado_1.empleadoRouter);
app.use('/calendario', calendario_1.calendarioRouter);
app.use('/pensiones', pension_1.pensionRouter);
app.use('/anotaciones-relevantes', anotacionesRelevantes_1.anotacionesRelevantesRouter);
app.use('/announcements', anuncios_1.anunciosRouter);
app.use('/cursos', cursos_1.cursosRouter);
app.use('/notas', notas_1.notasRouter);
app.use('/pagos', pagos_1.pagosRouter);
app.use('/asistencia-empleados', asistenciaColegio_1.asistenciaEmpleadosRouter);
app.get('/pass', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.query;
    const hashedPass = yield (0, hashPassword_1.hashPassword)(password);
    res.send(hashedPass);
}));
// app.use('/pagos', pagosRouter)
app.use((err, _req, res, _next) => {
    console.log('error catched');
    console.log({ err });
    (0, errors_1.errorResponseHandler)(res, err);
});
app.listen(PORT, () => {
    console.log(`jesus nazareno server is listening`);
});
