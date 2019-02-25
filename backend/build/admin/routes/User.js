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
const mssql_1 = require("mssql");
class User {
    constructor() {
        this.router = express.Router();
        this.router.get('/api/users', this.getAllUsers);
        this.router.post('/api/users', this.save);
        this.router.get('/api/users/:id', this.getSingleUser);
        this.router.delete('/app/users/:id', this.delete);
    }
    getAllUsers(request, response, next) {
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                let recordSet;
                let results;
                let page = request.params.page;
                let limit = request.params.limit;
                try {
                    let fetchUsers = new mssql_1.PreparedStatement();
                    yield fetchUsers.prepare(`SELECT * FROM [TBCUSTOMERS] `);
                    recordSet = (yield fetchUsers.execute({})).recordsets[0];
                    results = recordSet.map.stream(element => {
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
                    response.statusCode == 200;
                    response.write(`<ul>
                                    <li>${results}<li>
                                </ul>`);
                    response.send(results);
                }
                catch (error) {
                    // response.json({
                    //     STATUS: '400',
                    //     MESSAGE: 'Bad Request',
                    // });
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
exports.default = (new User()).router;
