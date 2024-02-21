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
exports.User = void 0;
const db_1 = require("../db");
const db = db_1.mongoClient.db();
class User {
    static getById({ collectionName, _id }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const user = db.collection(collectionName).findOne({ _id });
                resolve(user);
            }));
        });
    }
    static getByUsername({ collectionName, username }) {
        return new Promise((resolve) => {
            const user = db.collection(collectionName).findOne({ username });
            resolve(user);
        });
    }
    static getInfo({ collectionName, userId }) {
        return new Promise((resolve) => {
            const userInfo = db.collection(collectionName).findOne({ userId: userId });
            resolve(userInfo);
        });
    }
}
exports.User = User;
