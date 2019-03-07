"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../config/swagger.json");
exports.handleAPIDocs = (router) => router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
