"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = void 0;
// const allowedOrigins = ['http://localhost:3000', 'https://jesusnazareno.netlify.app']
const cors = (req, res, next) => {
    const origin = req.get('origin'); //extract origin from the headers
    console.log({ origin });
    // res.setHeader('Access-Control-Allow-Origin', origin!)
    //   res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS, PATCH')
    //   res.setHeader('Access-Control-Allow-Headers', ['Year', 'Nivel', 'Token', 'Content-Type'])
    //   res.setHeader('Access-Control-Expose-Headers', 'Token')
    //   if (req.method === 'OPTIONS') {
    //     return res.status(200).end()
    //   }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', ['PUT', 'POST', 'DELETE', 'GET', 'PATCH', 'OPTIONS']);
    res.setHeader('Access-Control-Allow-Headers', ['Year', 'Nivel', 'Token', 'Content-Type', 'Content-Length', 'Accept', 'Authentication', 'File-Size', 'Accept-Encoding', 'Accept-Language']);
    res.setHeader('Access-Control-Expose-Headers', ['Token']);
    res.setHeader('Access-Control-Allow-credentials', 'include');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    return next();
};
exports.cors = cors;
