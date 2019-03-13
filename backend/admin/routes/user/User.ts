import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { Authentication } from '../../../classes/Authentication';
import { HTTP400Error, HTTP401Error } from "../../utils/httpErrors";
import { PreparedStatement } from 'mssql';
import { string, any } from 'joi';
import { log } from 'util';
const sql = require('mssql');
import { dbconnection } from '../../../classes/DBConnection';
export default [
    {
        path: "/api/users",
        method: "get",
        handler: (async (req: Request, res: Response, next: NextFunction) => {
            try {
                let page: number = req.params.page;
                let limit : number = req.params.limit;
                let request = await new sql.Request(dbconnection);
                request.stream = true;
                request.query(`SELECT * FROM [TBCUSTOMERS]`);
                let index = 1
                let results = {}
                request.on('recordset', columns => {
                })
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
                        }
                        index += 1
                });
                request.on('error', err => {
                });
                request.on('done', result => {
                    res.status(200).send(results).end();
                });
            } catch (error) {
                res.status(500).send(error.message);
            }
        })

    },
    {
        path: "/api/users/:id",
        method: "get",
        handler: (async (req: Request, res: Response, next: NextFunction) => {
            try {
                let request = await new sql.Request(dbconnection);
                let query = `SELECT [FIRSTNAME] as firstName, [LASTNAME] as lastName, [OTHERNAMES] as otherName, [EMAILADDRESS] as emailAddress,[CUSTOMERNO] as mobileNumber,[IDENTIFICATIONID] as idNumber, [COUNTRY] as country, [NATIONALITY] as nationality, [DATEOFBIRTH] as dateOfBirth, [GENDER] as gender FROM [TBCUSTOMERS] WHERE ID=@userId`
                request.input('userId', req.params.id)
                let result = await request.query(query);
                res.send(result.recordset[0]);
                res.status(200).end();
            } catch (error) {

            }
        })
    },
    {
        path: "/api/users",
        method: "post",
        handler: (async (req: Request, res: Response, next: NextFunction) => {
            try {
                var usr = new Authentication()
                let response = await usr.register(req.body['firstName'], req.body['lastName'], req.body['otherName'], req.body['mobileNumber'], req.body['emailAddress'], req.body['country'], req.body['dateOfBirth'], req.body['gender'], req.body['nationality'], req.body['nationalID'], req.body['password'], req.body['passwordConfirm']);
                if (response.type === 'success') {
                    res.status(201).send(req.body).end();
                } else {
                    res.status(500).send(response).end();
                }
            } catch (error) {
                console.log(error)
            }
        })
    },
    {
        path: "/api/users/:id",
        method: "post",
        handler: (async (req: Request, res: Response, next: NextFunction) => {
            try {
                var usr = new Authentication()
                let response = await usr.updateUser(req.body['firstName'], req.body['lastName'], req.body['otherName'], req.body['mobileNumber'], req.body['emailAddress'], req.body['country'], req.body['dateOfBirth'], req.body['gender'], req.body['nationality'], req.body['idNumber'], req.params.id);
                if (response.type === 'success') {
                    res.status(201).send(response).end();
                } else {
                    res.status(500).send(response).end();
                }
            } catch (error) {
                console.log(error)
            }
        })
    }
];

