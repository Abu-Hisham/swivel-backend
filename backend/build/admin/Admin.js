"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
class Admin {
    constructor() {
        this.router = express.Router();
    }
}
exports.default = (new Admin()).router;
