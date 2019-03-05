import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { HTTP400Error, HTTP401Error } from "../../utils/httpErrors";
import { PreparedStatement } from 'mssql';
import { string, any } from 'joi';
import { log } from 'util';
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
}
class User {
    router: express.Router;

    constructor() {
        this.router = express.Router();
        this.router.get('/', this.getAllUsers);
        this.router.post('/api/users', this.save);
        this.router.get('/api/users/:id', this.getSingleUser);
        this.router.delete('/app/users/:id', this.delete)
    }
    private getAllUsers(req: Request, response: express.Response, next: express.NextFunction) {

    }
    private getSingleUser(req: Request, response: express.Response, next: express.NextFunction) { }
    private save(req: Request, response: express.Response, next: express.NextFunction) {
    }
    private delete(req: Request, response: express.Response, next: express.NextFunction) { }
}

export default [
    {
        path: "/api/users/:page/:limit",
        method: "get",
        handler: (async (req: Request, res: Response, next: NextFunction) => {
            try {
                let page = req.params.page;
                let limit = req.params.limit;
                let pool = await sql.connect(conn);
                let request = await new sql.Request(pool);
                request.stream = true;
                request.query(`SELECT * FROM [TBCUSTOMERS]`);
                let index = 0
                let results = {}
                request.on('recordset', columns => {

                })
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
                        }
                    }
                });
                request.on('error', err => {
                });
                request.on('done', result => {
                    res.send(results)
                    res.end();
                });
            } catch (error) {
                res.status(500).send();
            }
        })

    }
];

