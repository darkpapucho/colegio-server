"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursosKeyInicial = exports.CursosLabelInicial = exports.CursosKeyPrimaria = exports.CursosLabelPrimaria = exports.SalonesPrimaria = exports.SalonesInicial = exports.GradosInicial = exports.GradosPrimaria = exports.VALID_GRADOS = exports.Secciones = exports.VALID_SECCIONES = exports.Niveles = exports.VALID_NIVELES = exports.VALID_SEXOS = exports.VALID_YEARS = exports.ESTADOS_MATRICULA = exports.VALID_GRADOS_DESTINO = exports.VALID_NOTAS = void 0;
exports.VALID_NOTAS = ['A', 'B', 'C', 'AD'];
//grados destino
exports.VALID_GRADOS_DESTINO = [
    'Grupo 3 años',
    'Grupo 4 años',
    'Grupo 5 años',
    'PRIMERO PRIMARIA',
    'PRIMERO',
    'SEGUNDO',
    'TERCERO',
    'CUARTO',
    'QUINTO',
    'SEXTO',
    'PRIMERO SECUNDARIA',
];
// estados matricula
exports.ESTADOS_MATRICULA = ['DEFINITIVA', 'PENDIENTE', 'TRASLADADO', 'EN PROCESO'];
//years
exports.VALID_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025'];
//sexo
exports.VALID_SEXOS = ['Hombre', 'Mujer'];
//Niveles
exports.VALID_NIVELES = ['primaria', 'inicial'];
var Niveles;
(function (Niveles) {
    Niveles["PRIMARIA"] = "primaria";
    Niveles["INICIAL"] = "inicial";
})(Niveles || (exports.Niveles = Niveles = {}));
//secciones
exports.VALID_SECCIONES = ['A', 'B', 'C'];
var Secciones;
(function (Secciones) {
    Secciones["A"] = "A";
    Secciones["B"] = "B";
    Secciones["c"] = "C";
})(Secciones || (exports.Secciones = Secciones = {}));
//grados
exports.VALID_GRADOS = ['Grupo 3 años', 'Grupo 4 años', 'Grupo 5 años', 'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO'];
var GradosPrimaria;
(function (GradosPrimaria) {
    GradosPrimaria["PRIMERO"] = "PRIMERO";
    GradosPrimaria["SEGUNDO"] = "SEGUNDO";
    GradosPrimaria["TERCERO"] = "TERCERO";
    GradosPrimaria["CUARTO"] = "CUARTO";
    GradosPrimaria["QUINTO"] = "QUINTO";
    GradosPrimaria["SEXTO"] = "SEXTO";
})(GradosPrimaria || (exports.GradosPrimaria = GradosPrimaria = {}));
var GradosInicial;
(function (GradosInicial) {
    GradosInicial["Grupo3a\u00F1os"] = "Grupo 3 a\u00F1os";
    GradosInicial["Grupo4a\u00F1os"] = "Grupo 4 a\u00F1os";
    GradosInicial["Grupo5a\u00F1os"] = "Grupo 5 a\u00F1os";
})(GradosInicial || (exports.GradosInicial = GradosInicial = {}));
//SALONES
var SalonesInicial;
(function (SalonesInicial) {
    SalonesInicial["Grupo3a\u00F1os_A"] = "Grupo 3 a\u00F1os A";
    SalonesInicial["Grupo3a\u00F1os_B"] = "Grupo 3 a\u00F1os B";
    SalonesInicial["Grupo3a\u00F1os_C"] = "Grupo 3 a\u00F1os C";
    SalonesInicial["Grupo4a\u00F1os_A"] = "Grupo 4 a\u00F1os A";
    SalonesInicial["Grupo4a\u00F1os_B"] = "Grupo 4 a\u00F1os B";
    SalonesInicial["Grupo4a\u00F1os_C"] = "Grupo 4 a\u00F1os C";
    SalonesInicial["Grupo5a\u00F1os_A"] = "Grupo 5 a\u00F1os A";
    SalonesInicial["Grupo5a\u00F1os_B"] = "Grupo 5 a\u00F1os B";
    SalonesInicial["Grupo5a\u00F1os_C"] = "Grupo 5 a\u00F1os C";
})(SalonesInicial || (exports.SalonesInicial = SalonesInicial = {}));
var SalonesPrimaria;
(function (SalonesPrimaria) {
    SalonesPrimaria["PRIMERO_A"] = "PRIMERO A";
    SalonesPrimaria["PRIMERO_B"] = "PRIMERO B";
    SalonesPrimaria["PRIMERO_C"] = "PRIMERO C";
    SalonesPrimaria["SEGUNDO_A"] = "SEGUNDO A";
    SalonesPrimaria["SEGUNDO_B"] = "SEGUNDO B";
    SalonesPrimaria["SEGUNDO_C"] = "SEGUNDO C";
    SalonesPrimaria["TERCERO_A"] = "TERCERO A";
    SalonesPrimaria["TERCERO_B"] = "TERCERO B";
    SalonesPrimaria["TERCERO_C"] = "TERCERO C";
    SalonesPrimaria["CUARTO_A"] = "CUARTO A";
    SalonesPrimaria["CUARTO_B"] = "CUARTO B";
    SalonesPrimaria["CUARTO_C"] = "CUARTO C";
    SalonesPrimaria["QUINTO_A"] = "QUINTO A";
    SalonesPrimaria["QUINTO_B"] = "QUINTO B";
    SalonesPrimaria["QUINTO_C"] = "QUINTO C";
    SalonesPrimaria["SEXTO_A"] = "SEXTO A";
    SalonesPrimaria["SEXTO_B"] = "SEXTO B";
    SalonesPrimaria["SEXTO_C"] = "SEXTO C";
})(SalonesPrimaria || (exports.SalonesPrimaria = SalonesPrimaria = {}));
//CURSOS
var CursosLabelPrimaria;
(function (CursosLabelPrimaria) {
    CursosLabelPrimaria["MATEMATICA"] = "Matem\u00E1tica";
    CursosLabelPrimaria["CIENCIA_TECNOLOGIA"] = "Ciencia y Tecnolog\u00EDa";
    CursosLabelPrimaria["PERSONAL_SOCIAL"] = "Personal Social";
    CursosLabelPrimaria["EDUCACION_FISICA"] = "Educaci\u00F3n F\u00EDsica";
    CursosLabelPrimaria["COMUNICACION"] = "Comunicaci\u00F3n";
    CursosLabelPrimaria["ARTE_CULTURA"] = "Arte y Cultura";
    CursosLabelPrimaria["INGLES"] = "Ingl\u00E9s como lengua extranjera";
    CursosLabelPrimaria["RELIGION"] = "Educaci\u00F3n Religiosa";
    CursosLabelPrimaria["COMPETENCIAS_TRANSVERSALES"] = "Competencias Transversales";
})(CursosLabelPrimaria || (exports.CursosLabelPrimaria = CursosLabelPrimaria = {}));
var CursosKeyPrimaria;
(function (CursosKeyPrimaria) {
    CursosKeyPrimaria["MATEMATICA"] = "matematica";
    CursosKeyPrimaria["CIENCIA_TECNOLOGIA"] = "cienciaTecnologia";
    CursosKeyPrimaria["PERSONAL_SOCIAL"] = "personalSocial";
    CursosKeyPrimaria["EDUCACION_FISICA"] = "educacionFisica";
    CursosKeyPrimaria["COMUNICACION"] = "comunicacion";
    CursosKeyPrimaria["ARTE_CULTURA"] = "arteCultura";
    CursosKeyPrimaria["INGLES"] = "ingles";
    CursosKeyPrimaria["RELIGION"] = "religion";
    CursosKeyPrimaria["COMPETENCIAS_TRANSVERSALES"] = "competenciasTransversales";
})(CursosKeyPrimaria || (exports.CursosKeyPrimaria = CursosKeyPrimaria = {}));
var CursosLabelInicial;
(function (CursosLabelInicial) {
    CursosLabelInicial["MATEMATICA"] = "Matem\u00E1tica";
    CursosLabelInicial["CIENCIA_TECNOLOGIA"] = "Ciencia y Tecnolog\u00EDa";
    CursosLabelInicial["PERSONAL_SOCIAL"] = "Personal Social";
    CursosLabelInicial["COMUNICACION"] = "Comunicaci\u00F3n";
    CursosLabelInicial["PSICOMOTRIZ"] = "Psicomotriz";
    CursosLabelInicial["COMPETENCIAS_TRANSVERSALES"] = "Competencias Transversales";
})(CursosLabelInicial || (exports.CursosLabelInicial = CursosLabelInicial = {}));
var CursosKeyInicial;
(function (CursosKeyInicial) {
    CursosKeyInicial["MATEMATICA"] = "matematica";
    CursosKeyInicial["CIENCIA_TECNOLOGIA"] = "cienciaTecnologia";
    CursosKeyInicial["PERSONAL_SOCIAL"] = "personalSocial";
    CursosKeyInicial["COMUNICACION"] = "comunicacion";
    CursosKeyInicial["PSICOMOTRIZ"] = "psicomotriz";
    CursosKeyInicial["COMPETENCIAS_TRANSVERSALES"] = "competenciasTransversales";
})(CursosKeyInicial || (exports.CursosKeyInicial = CursosKeyInicial = {}));
