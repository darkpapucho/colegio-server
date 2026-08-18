"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAsistenciaMessage = void 0;
function getAsistenciaMessage(time) {
    const [hour, minute, _] = time.split(':');
    if (Number(hour) >= 7 && Number(minute) >= 45) {
        return 'Felicitaciones! Has llegado a tiempo';
    }
    return 'Has llegado tarde al trabajo';
}
exports.getAsistenciaMessage = getAsistenciaMessage;
