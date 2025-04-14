"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payment = exports.order = exports.client = void 0;
const mercadopago_1 = require("mercadopago");
exports.client = new mercadopago_1.MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 },
});
exports.order = new mercadopago_1.Order(exports.client);
exports.payment = new mercadopago_1.Payment(exports.client);
