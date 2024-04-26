"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarioRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const Calendario_1 = __importDefault(require("../controllers/Calendario"));
exports.calendarioRouter = (0, express_1.Router)();
exports.calendarioRouter.post('/enable-calendar-days', verifyCredentials_1.verifyCredentials, Calendario_1.default.enableCalendarDays);
exports.calendarioRouter.get('/fetch-calendario', verifyCredentials_1.verifyCredentials, Calendario_1.default.fetchCalendario);
exports.calendarioRouter.post('/delete-day', verifyCredentials_1.verifyCredentials, Calendario_1.default.deleteDayFromCalendar);
exports.calendarioRouter.post('/report-tardanza-alumno', verifyCredentials_1.verifyCredentials, Calendario_1.default.reportTardanzaAlumno);
exports.calendarioRouter.get('/fetch-day-id', verifyCredentials_1.verifyCredentials, Calendario_1.default.fetchDayId);
exports.calendarioRouter.get('/fetch-current-periodo', verifyCredentials_1.verifyCredentials, Calendario_1.default.fetchCurrentPeriodo);
exports.calendarioRouter.post('/set-current-periodo', verifyCredentials_1.verifyCredentials, Calendario_1.default.setCurrentPeriodo);
