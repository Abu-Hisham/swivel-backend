"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorHandler = require("../utils/ErrorHandler");
const handle404Error = (router) => {
    router.use((req, res) => {
        ErrorHandler.notFoundError();
    });
};
const handleClientError = (router) => {
    router.use((err, req, res, next) => {
        ErrorHandler.clientError(err, res, next);
    });
};
const handleServerError = (router) => {
    router.use((err, req, res, next) => {
        ErrorHandler.serverError(err, res, next);
    });
};
exports.default = [handle404Error, handleClientError, handleServerError];
