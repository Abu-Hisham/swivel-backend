"use strict";
// // import * as express from 'express';
// const express = require('express')
// import { appendFile } from 'fs';
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express(); 
// const router = require('./routes/User');
// const server = http.createServer(app);
// import { applyMiddleware } from "./utils";
// import middleware from "./middleware";
// // class Admin {
// //     // router: express.Router;
// //     // const app = express.application;
// //     constructor() {
// //         // this.router = express.Router();
// //     }
// // }
// applyMiddleware(middleware, app);
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));
// app.use('api/users',router);
// server.listen(3000, ()=>console.log("Listening to port 3000..."));
const express = require("express");
const http = require("http");
const utils_1 = require("./utils");
const middleware_1 = require("./middleware");
const errorHandlers_1 = require("./middleware/errorHandlers");
const routes_1 = require("./routes");
process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});
process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
});
const router = express();
utils_1.applyMiddleware(middleware_1.default, router);
utils_1.applyRoutes(routes_1.default, router);
utils_1.applyMiddleware(errorHandlers_1.default, router);
const { PORT = 4000 } = process.env;
const server = http.createServer(router);
server.listen(PORT, () => console.log(`Server is running http://localhost:${PORT}...`));
