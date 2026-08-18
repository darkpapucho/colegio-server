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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
class FingerprintÇurrentId {
    static getNextFingerId() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient.db().collection('fingerprintcurrentid').findOne({});
            if (response == null) {
                const insertResponse = yield db_1.mongoClient.db().collection('fingerprintcurrentid').insertOne({ currentId: 1 });
                if (!insertResponse.insertedId)
                    throw new Error('no se pudo obtener un id para la nueva huella digital');
                return 1;
            }
            return response.currentId + 1;
        });
    }
    static increaseFingerId() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection('fingerprintcurrentid')
                .updateOne({}, { $inc: { currentId: 1 } });
            return response;
        });
    }
}
exports.default = FingerprintÇurrentId;
