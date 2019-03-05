"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sql = require('mssql');
// import * as conn from '../../../classes/DBConnection';
const conn = {
    server: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'swivel',
    options: {
        encrypt: true
    }
};
class User {
    constructor() {
        this.router = express.Router();
        this.router.get('/', this.getAllUsers);
        this.router.post('/api/users', this.save);
        this.router.get('/api/users/:id', this.getSingleUser);
        this.router.delete('/app/users/:id', this.delete);
    }
    getAllUsers(req, response, next) {
    }
    getSingleUser(req, response, next) { }
    save(req, response, next) {
    }
    delete(req, response, next) { }
}
exports.default = [
    {
        path: "/api/users/:page/:limit",
        method: "get",
        handler: ((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let page = req.params.page;
                let limit = req.params.limit;
                let pool = yield sql.connect(conn);
                let request = yield new sql.Request(pool);
                request.stream = true;
                request.query(`SELECT * FROM [TBCUSTOMERS]`);
                let index = 0;
                let results = {};
                request.on('recordset', columns => {
                });
                request.on('row', row => {
                    if (index <= ((page * limit) - 1)) {
                        results[index += 1] = {
                            'firstName': row['FIRSTNAME'],
                            'lastName': row['LASTNAME'],
                            'otherName': row['OTHERNAMES'],
                            'emailAddress': row['EMAILADDRESS'],
                            'mobileNumber': row['CUSTOMERNO'],
                            'idNumber': row['IDENTIFICATIONID'],
                            'country': row['COUNTRY'],
                            'nationality': row['NATIONALITY'],
                            'dateOfBirth': row['DATEOFBIRTH'],
                            'gender': row['GENDER']
                        };
                    }
                });
                request.on('error', err => {
                });
                request.on('done', result => {
                    // res.write(JSON.stringify(results));
                    res.send(results);
                    res.end();
                });
            }
            catch (error) {
                res.status(500).send();
            }
        }))
    }
];
