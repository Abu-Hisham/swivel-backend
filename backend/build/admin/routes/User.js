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
const conn = require('../../classes/DBConnection');
class User {
    constructor() {
        this.router = express.Router();
        this.router.get('/', this.getAllUsers);
        this.router.post('/api/users', this.save);
        this.router.get('/api/users/:id', this.getSingleUser);
        this.router.delete('/app/users/:id', this.delete);
    }
    getAllUsers(request, response, next) {
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                let results = [];
                let page = request.params.page;
                let limit = request.params.limit;
                try {
                    const ps = new sql.PreparedStatement(conn);
                    yield ps.prepare(`SELECT * FROM [TBCUSTOMERS]`, err => {
                        ps.stream = true;
                        const request = ps.execute({});
                        // request.on('recordset', columns =>{
                        // });
                        request.on('row', row => {
                            if (results.length >= ((page * limit) - 1)) {
                                results.push = row.map(element => {
                                    return {
                                        firstName: element['FIRSTNAME'],
                                        lastName: element['LASTNAME'],
                                        otherName: element['OTHERNAME'],
                                        emailAddress: element['EMAILADDRESS'],
                                        mobileNumber: element['MOBILENUMBER'],
                                        idNumber: element['IDENTIFICATIONID'],
                                        country: element['COUNTRY'],
                                        nationality: element['NATIONALITY'],
                                        dateOfBirth: element['DATEOFBIRTH'],
                                        gender: element['GENDER']
                                    };
                                });
                            }
                        });
                        response.write(`<ul>`);
                        results.forEach(element => {
                            response.write(`<li>${element.firstName}, ${element.lasttName}, ${element.otherName}, ${element.emailAddress}, ${element.mobileNumber}, ${element.idNumber}, ${element.gender}, ${element.country}, ${element.nationality}, ${element.dateOfBirth} <li>`);
                        });
                        response.write(`</ul>`);
                        request.on('error', err => {
                        });
                        request.on('done', result => {
                            ps.unprepare(err => {
                                // ... error checks
                            });
                        });
                    });
                    response.statusCode == 200;
                    // response.send(results)
                }
                catch (error) {
                    response.statusCode == 400;
                    response.end;
                }
            });
        });
    }
    getSingleUser(request, response, next) { }
    save(request, response, next) {
    }
    delete(request, response, next) { }
}
// export  (new User()).router;
module.exports = (new User()).router;
