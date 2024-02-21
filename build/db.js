"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoClient = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.mongoClient = new mongodb_1.MongoClient(process.env.MONGO_URI);
