// // import * as express from 'express';
// const express = require('express')
// import { appendFile } from 'fs';

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

import * as express from "express";
import * as http from "http";
import { applyMiddleware, applyRoutes } from "./utils";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";
import routes from "./routes";
process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
  });
  
  process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
  });
  
  const router = express();
  applyMiddleware(middleware, router);
  applyRoutes(routes, router);
  applyMiddleware(errorHandlers, router);
  
  const { PORT = 4000 } = process.env;
  const server = http.createServer(router);
  
  server.listen(PORT, () =>
    console.log(`Server is running http://localhost:${PORT}...`)
  );