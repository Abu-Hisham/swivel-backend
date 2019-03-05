"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("cors");
const parser = require("body-parser");
const compression = require("compression");
exports.handleCors = (router) => router.use(cors({ credentials: true, origin: true }));
exports.handleBodyRequestParsing = (router) => {
    router.use(parser.urlencoded({ extended: true }));
    router.use(parser.json());
};
exports.handleCompression = (router) => {
    router.use(compression());
};
