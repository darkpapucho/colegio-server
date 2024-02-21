"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsAMatriculado = exports.assertIsNuevoAlumno = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
const enums_2 = require("../error/enums");
const nuevoAlumnoSchema = zod_1.z.object({
    nombres: zod_1.z.string().min(4).max(30),
    apellidos: zod_1.z.string().min(4).max(30),
    grado: zod_1.z.enum(enums_1.VALID_GRADOS),
    seccion: zod_1.z.enum(enums_1.VALID_SECCIONES),
    fechaMatricula: zod_1.z.string(),
    sexo: zod_1.z.enum(enums_1.VALID_SEXOS),
    dni: zod_1.z.string().length(8).optional(),
    codigoEstudiante: zod_1.z.string().length(14),
});
function assertIsNuevoAlumno(alumno) {
    const result = nuevoAlumnoSchema.safeParse(alumno);
    if (result.success) {
        return;
    }
    else {
        result.error.issues.forEach((issue) => console.log({ message: issue.message, field: issue.path[0] }));
        console.log('invalid alumno');
        throw new Error(enums_2.ErrorMessages.INVALID_REQUEST);
    }
}
exports.assertIsNuevoAlumno = assertIsNuevoAlumno;
const AMatriculadoSchema = zod_1.z.object({
    nombres: zod_1.z.string({ required_error: 'nombres del alumno son obligatorios' }).min(4, 'nombres debe tener al menos 4 caracteres').max(25, 'nombres no debe tener mas de 40 caracteres'),
    apellidos: zod_1.z.string({ required_error: 'apellidos del alumno son obligatorios' }).min(4, 'apellidos debe tener al menos 4 caracteres').max(25, 'apellidos no debe tener mas de 40 caracteres'),
    grado: zod_1.z.enum(enums_1.VALID_GRADOS, { invalid_type_error: 'grado inválido' }),
    seccion: zod_1.z.enum(enums_1.VALID_SECCIONES, { invalid_type_error: 'seccion inválida' }),
    estadoMatricula: zod_1.z.enum(enums_1.ESTADOS_MATRICULA, { invalid_type_error: 'invalido estado de matrícula' }),
    fechaMatricula: zod_1.z.string({ required_error: 'falta la fecha de matrícula' }).datetime({ message: 'fecha de matrícula inválida' }),
    fechaRetiro: zod_1.z.string().datetime({ message: 'fecha de retiro inválida' }).optional(),
    sexo: zod_1.z.enum(enums_1.VALID_SEXOS, { invalid_type_error: 'sexo del alumno no válido' }),
    dni: zod_1.z.string().min(8, 'el dni debe tener 8 digitos').max(8, 'el dni debe tener 8 dígitos').optional(),
    codigoEstudiante: zod_1.z.string({ required_error: 'falta el codigo de estudiante del alumno' }).min(14, 'el codigo de estudiante debe tener 14 dígitos').max(14, 'el codigo de estudiante debe tener 14 dígitos'),
    nombreCompleto: zod_1.z.string({ required_error: 'faltan los datos del alumno' }).max(52, 'los datos del alumno no deben exceder los 52 caracteres'),
});
function assertIsAMatriculado(alumno) {
    const result = AMatriculadoSchema.safeParse(alumno);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }
}
exports.assertIsAMatriculado = assertIsAMatriculado;
