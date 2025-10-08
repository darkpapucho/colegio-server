"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = void 0;
const ALLOWED_ORIGINS = ((_a = process.env.ALLOWED_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000', 'http://localhost:3050'];
const cors = (req, res, next) => {
    const origin = req.get('origin'); //extract origin from the headers
    //const route = req.url
    if (origin && ALLOWED_ORIGINS.some((element) => element === origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', ['PUT', 'POST', 'DELETE', 'GET', 'PATCH', 'OPTIONS']);
        res.setHeader('Access-Control-Allow-Headers', [
            'Year',
            'Nivel',
            'Token',
            'Content-Type',
            'Content-Length',
            'Accept',
            'Authentication',
            'File-Size',
            'Accept-Encoding',
            'Accept-Language',
        ]);
        res.setHeader('Access-Control-Expose-Headers', ['Token']);
        res.setHeader('Access-Control-Allow-credentials', 'include');
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
    }
    return next();
};
exports.cors = cors;
