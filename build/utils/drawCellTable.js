"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCell = void 0;
function drawCell(document, data) {
    var _a, _b, _c, _d, _e, _f, _g;
    const verticalOffSet = ((_a = data.options) === null || _a === void 0 ? void 0 : _a.textVerticalOffSet) || 0;
    document.rect(data.begin.x, data.begin.y, data.width, data.height).fillAndStroke((_c = (_b = data === null || data === void 0 ? void 0 : data.options) === null || _b === void 0 ? void 0 : _b.fillColor) !== null && _c !== void 0 ? _c : '#FFF', (_e = (_d = data === null || data === void 0 ? void 0 : data.options) === null || _d === void 0 ? void 0 : _d.strokeColor) !== null && _e !== void 0 ? _e : '#000');
    document
        .fill('#000')
        .fontSize(((_f = data.options) === null || _f === void 0 ? void 0 : _f.fontSize) || 15)
        .text(data.content, data.begin.x, data.begin.y + verticalOffSet, { width: data.width, align: (_g = data === null || data === void 0 ? void 0 : data.options) === null || _g === void 0 ? void 0 : _g.align });
}
exports.drawCell = drawCell;
