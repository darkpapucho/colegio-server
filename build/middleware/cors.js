"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = void 0;
const allowedOrigins = ['http://localhost:3000'];
const cors = (req, res, next) => {
    const origin = req.get('origin'); //extract origin from the headers
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', ['Year', 'Nivel', 'Token', 'Content-Type']);
        res.setHeader('Access-Control-Expose-Headers', 'Token');
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
    }
    return next();
};
exports.cors = cors;
