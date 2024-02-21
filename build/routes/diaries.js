"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diariesRouter = void 0;
const express_1 = require("express");
const diary_1 = require("../services/diary");
exports.diariesRouter = (0, express_1.Router)();
exports.diariesRouter.get('/', (_req, res) => {
    res.send('fetching all entry diaries');
});
exports.diariesRouter.post('/', (req, res) => {
    const entry = req.body.data;
    (0, diary_1.addEntry)(entry);
    res.send('agregado');
});
