"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsProfesorData = exports.assertIsEmitirDocumentsData = exports.assertIsAMatriculado = exports.assertIsNuevoAlumno = exports.assertIsString = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
const enums_2 = require("../error/enums");
function assertIsString(value) {
    if (typeof value === 'string')
        return;
    throw new Error(`Invalid String Value: ${value}`);
}
exports.assertIsString = assertIsString;
const nuevoAlumnoSchema = zod_1.z.object({
    nombres: zod_1.z.string().min(4).max(30),
    apellidos: zod_1.z.string().min(4).max(30),
    grado: zod_1.z.enum(enums_1.VALID_GRADOS),
    seccion: zod_1.z.enum(enums_1.VALID_SECCIONES),
    fechaMatricula: zod_1.z.string(),
    sexo: zod_1.z.enum(enums_1.VALID_SEXOS),
    dni: zod_1.z.string().refine((value) => value === '' || (value === null || value === void 0 ? void 0 : value.length) === 8, { message: 'el dni debe ser de 8 dígitos' }),
    codigoEstudiante: zod_1.z.string({ required_error: 'falta el codigo de estudiante del alumno' }).min(14, 'el codigo de estudiante debe tener 14 dígitos').max(14, 'el codigo de estudiante debe tener 14 dígitos'),
});
const profesorDataSchema = zod_1.z.object({
    // userId: z.string(),
    // rol: z.string(),
    nombres: zod_1.z.string().min(3).max(30),
    apellidos: zod_1.z.string().min(3).max(30),
    dni: zod_1.z.string().length(8),
    telefono: zod_1.z.number().optional(),
    correo: zod_1.z.string().min(10).email().optional(),
    salones: zod_1.z
        .object({
        label: zod_1.z.string(),
        value: zod_1.z.object({
            grado: zod_1.z.enum(enums_1.VALID_GRADOS),
            seccion: zod_1.z.enum(enums_1.VALID_SECCIONES),
        }),
        tutor: zod_1.z.boolean(),
        order: zod_1.z.number(),
        cursos: zod_1.z.object({ label: zod_1.z.string(), key: zod_1.z.string() }).array(),
    })
        .array(),
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
    dni: zod_1.z.string().refine((value) => value === '' || (value === null || value === void 0 ? void 0 : value.length) === 8, { message: 'el dni debe ser de 8 dígitos' }),
    codigoEstudiante: zod_1.z.string({ required_error: 'falta el codigo de estudiante del alumno' }).min(14, 'el codigo de estudiante debe tener 14 dígitos').max(14, 'el codigo de estudiante debe tener 14 dígitos'),
    nombreCompleto: zod_1.z.string({ required_error: 'faltan los datos del alumno' }).max(52, 'los datos del alumno no deben exceder los 52 caracteres'),
});
const EmitirDocumentosDataSchema = zod_1.z.object({
    colegioDestino: zod_1.z.string(),
    codigoModular: zod_1.z.string(),
    selectedDocuments: zod_1.z.object({ resolucionTraslado: zod_1.z.boolean(), certificadoNoAdeudo: zod_1.z.boolean(), certificadoConducta: zod_1.z.boolean() }),
    fechaEmision: zod_1.z.string(),
    gradoDestino: zod_1.z.enum(enums_1.VALID_GRADOS_DESTINO),
});
function assertIsAMatriculado(alumno) {
    const result = AMatriculadoSchema.safeParse(alumno);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }
    return;
}
exports.assertIsAMatriculado = assertIsAMatriculado;
function assertIsEmitirDocumentsData(data) {
    const result = EmitirDocumentosDataSchema.safeParse(data);
    if (!result.success) {
        throw new Error(enums_2.ErrorMessages.INVALID_REQUEST);
    }
    return;
}
exports.assertIsEmitirDocumentsData = assertIsEmitirDocumentsData;
function assertIsProfesorData(data) {
    const result = profesorDataSchema.safeParse(data);
    if (!result.success) {
        throw new Error(enums_2.ErrorMessages.INVALID_REQUEST);
    }
    return;
}
exports.assertIsProfesorData = assertIsProfesorData;
