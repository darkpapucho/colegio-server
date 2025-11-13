"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showOnly2Names = void 0;
function showOnly2Names(nombreCompleto) {
    const [apellidos, nombres] = nombreCompleto.split(', ');
    const splitNames = nombres.split(' ');
    if (splitNames.length > 2) {
        return apellidos + ', ' + splitNames[0] + ' ' + splitNames[1];
    }
    return nombreCompleto;
}
exports.showOnly2Names = showOnly2Names;
