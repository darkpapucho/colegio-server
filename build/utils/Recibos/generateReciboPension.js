"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function generateReciboPension(data, pdf, costo) {
    (0, utils_1.reciboHeader)(data, pdf);
    (0, utils_1.reciboBody)(data, pdf, costo);
    (0, utils_1.reciboMora)(data, pdf);
    (0, utils_1.reciboTotalPagar)(data, pdf);
    (0, utils_1.reciboFooter)(pdf);
}
exports.default = generateReciboPension;
