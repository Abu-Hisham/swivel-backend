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
const Authentication_1 = require("../../../classes/Authentication");
const sql = require('mssql');
const DBConnection_1 = require("../../../classes/DBConnection");
exports.default = [
    {
        path: "/api/users",
        method: "get",
        handler: ((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let page = req.params.page;
                let limit = req.params.limit;
                let request = yield new sql.Request(DBConnection_1.dbconnection);
                request.stream = true;
                request.query(`SELECT * FROM [TBCUSTOMERS]`);
                let index = 1;
                let results = {};
                request.on('recordset', columns => {
                });
                request.on('row', row => {
                    results[index] = {
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
                    index += 1;
                });
                request.on('error', err => {
                });
                request.on('done', result => {
                    res.status(200).send(results).end();
                });
            }
            catch (error) {
                res.status(500).send(error.message);
            }
        }))
    },
    {
        path: "/api/users/:id",
        method: "get",
        handler: ((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let request = yield new sql.Request(DBConnection_1.dbconnection);
                let query = `SELECT [FIRSTNAME] as firstName, [LASTNAME] as lastName, [OTHERNAMES] as otherName, [EMAILADDRESS] as emailAddress,[CUSTOMERNO] as mobileNumber,[IDENTIFICATIONID] as idNumber, [COUNTRY] as country, [NATIONALITY] as nationality, [DATEOFBIRTH] as dateOfBirth, [GENDER] as gender FROM [TBCUSTOMERS] WHERE ID=@userId`;
                request.input('userId', req.params.id);
                let result = yield request.query(query);
                res.send(result.recordset[0]);
                res.status(200).end();
            }
            catch (error) {
            }
        }))
    },
    {
        path: "/api/users",
        method: "post",
        handler: ((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                var usr = new Authentication_1.Authentication();
                let response = yield usr.register(req.body['firstName'], req.body['lastName'], req.body['otherName'], req.body['mobileNumber'], req.body['emailAddress'], req.body['country'], req.body['dateOfBirth'], req.body['gender'], req.body['nationality'], req.body['nationalID'], req.body['password'], req.body['passwordConfirm']);
                if (response.type === 'success') {
                    res.status(201).send(req.body).end();
                }
                else {
                    res.status(500).send(response).end();
                }
            }
            catch (error) {
                console.log(error);
            }
        }))
    },
    {
        path: "/api/users/:id",
        method: "post",
        handler: ((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                var usr = new Authentication_1.Authentication();
                let response = yield usr.updateUser(req.body['firstName'], req.body['lastName'], req.body['otherName'], req.body['mobileNumber'], req.body['emailAddress'], req.body['country'], req.body['dateOfBirth'], req.body['gender'], req.body['nationality'], req.body['idNumber'], req.params.id);
                if (response.type === 'success') {
                    res.status(201).send(response).end();
                }
                else {
                    res.status(500).send(response).end();
                }
            }
            catch (error) {
                console.log(error);
            }
        }))
    }
];
