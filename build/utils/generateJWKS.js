"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWKS = void 0;
const crypto_1 = require("crypto");
const path_1 = require("path");
const fs_1 = require("fs");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const SECRET = process.env.JWKS_PASSPHRASE;
function generateJWKS() {
    const { publicKey, privateKey } = (0, crypto_1.generateKeyPairSync)('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: SECRET,
        },
    });
    (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, '..', '..', 'keys', 'private.key'), privateKey);
    (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, '..', '..', 'keys', 'public.key'), publicKey);
}
exports.generateJWKS = generateJWKS;
