"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCell = void 0;
function drawCell(document, data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const verticalOffSet = ((_a = data.options) === null || _a === void 0 ? void 0 : _a.textVerticalOffSet) || 0;
    const paddingX = ((_b = data.options) === null || _b === void 0 ? void 0 : _b.paddingX) || 0;
    document.rect(data.begin.x, data.begin.y, data.width, data.height).fillAndStroke((_d = (_c = data === null || data === void 0 ? void 0 : data.options) === null || _c === void 0 ? void 0 : _c.fillColor) !== null && _d !== void 0 ? _d : '#FFF', (_f = (_e = data === null || data === void 0 ? void 0 : data.options) === null || _e === void 0 ? void 0 : _e.strokeColor) !== null && _f !== void 0 ? _f : '#000');
    document
        .fill((_h = (_g = data.options) === null || _g === void 0 ? void 0 : _g.textColor) !== null && _h !== void 0 ? _h : '#000')
        .fontSize(((_j = data.options) === null || _j === void 0 ? void 0 : _j.fontSize) || 15)
        .text(data.content, data.begin.x + paddingX / 2, data.begin.y + verticalOffSet, { width: data.width - paddingX, align: (_k = data === null || data === void 0 ? void 0 : data.options) === null || _k === void 0 ? void 0 : _k.align });
}
exports.drawCell = drawCell;
