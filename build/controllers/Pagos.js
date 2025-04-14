"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../error/errors");
// import Pagos from '../models/Pagos'
const responses_1 = require("../utils/responses");
const axios_1 = __importDefault(require("axios"));
class PagosController {
    static nuevoPago(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, phone, token, amount } = req.body;
                console.log({ email, phone, token, amount: +amount });
                const requestToken = yield axios_1.default.post('https://api.mercadopago.com/platforms/pci/yape/v1/payment?public_key=TEST-6e888352-5516-4958-98c5-afa41d70dbe6', { phoneNumber: '111111111', otp: '123456', requestId: '312736712fsaf4234' }, { headers: { 'Content-Type': 'application/json' } });
                console.log({ token: requestToken.data.id });
                const body = {
                    transaction_amount: 1.0,
                    token: 'TEST-12345678901234567890123456789012', // Fake test token
                    payment_method_id: 'yape',
                    payer: {
                        email: 'test_user_123456@testuser.com',
                        phone: { area_code: '51', number: '111111111' },
                    },
                    installments: 1,
                };
                console.log({ body });
                // const response = await Pagos.newPago({ body })
                const bearerToken = 'TEST-4685814286484028-041302-8914fc00609dd310f391c28744ebca75-163348043';
                yield axios_1.default.post('https://api.mercadopago.com/v1/payments', body, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Idempotency-Key': Date.now().toString() + Math.random().toString(36).substring(2),
                        Authorization: 'Bearer ' + bearerToken,
                    },
                });
                //   console.log({ response2 })
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                //   console.log((err as any).errors[0]?.details)
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = PagosController;
