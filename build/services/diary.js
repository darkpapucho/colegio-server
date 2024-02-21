"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEntry = exports.getDiaryEntries = void 0;
const diaries_json_1 = __importDefault(require("./diaries.json"));
const fs_1 = __importDefault(require("fs"));
const entries = diaries_json_1.default;
const getDiaryEntries = () => {
    return entries;
};
exports.getDiaryEntries = getDiaryEntries;
const addEntry = (entry) => {
    diaries_json_1.default.push(entry);
    fs_1.default.writeFileSync('./diaries.json', JSON.stringify(diaries_json_1.default));
};
exports.addEntry = addEntry;
