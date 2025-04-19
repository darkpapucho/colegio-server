"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anunciosRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const Announcements_1 = __importDefault(require("../controllers/Announcements"));
exports.anunciosRouter = (0, express_1.Router)();
exports.anunciosRouter.get('/fetch-announcements', verifyCredentials_1.verifyCredentials, Announcements_1.default.fetchAnnouncements);
exports.anunciosRouter.post('/add-announcement', verifyCredentials_1.verifyCredentials, Announcements_1.default.addAnnouncement);
exports.anunciosRouter.post('/delete-announcement', verifyCredentials_1.verifyCredentials, Announcements_1.default.deleteAnuncio);
