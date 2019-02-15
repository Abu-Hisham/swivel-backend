import { IKentaPayEnterprise } from "../interfaces/IKentaPayEnterprise";
import { ActivityResponse } from "../models/ActivityResponse";
import Joi = require('joi');
import sql = require('mssql');


export class Enterprise implements IKentaPayEnterprise {
    constructor() { }
    validateInput(companyName: string, contactPersonsName: string, companyUrl: string, emailAddress: string, phoneNumber: string, county: string) {
        const schema = Joi.object().keys({
            companyName: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            contactPersonsName: Joi.string().min(3).regex(/^[A-Z a-z]+$/).max(100).required().replace(/\s{2,}/g, ' '),
            companyUrl: Joi.string().max(500).regex(/^(http|https):\/\/[^ "]+$/).required(),
            emailAddress: Joi.string().max(100).email().required(),
            phoneNumber: Joi.string().min(10).regex(/^[0-9]/).max(15).required().replace(/\s{1,}/g, ''),
            county: Joi.string().required().min(3).regex(/^[A-Z a-z]+$/).replace(/\s{2,}/g, ' ')
        })
        const result = Joi.validate({ companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county }, schema);
        return result;
    }

    corporate(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county): Promise<ActivityResponse> {
        return new Promise<ActivityResponse>(async (resolve, reject) => {
            let result = this.validateInput(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county);
            const isCoporate = 1;
            if (result.error == null) {
                try {
                    let query = `SELECT * FROM TBCOUNTIES WHERE NAME=@county`;
                    let request = new sql.Request();
                    request.input('county', county);
                    let res = await request.query(query);
                    if (res.recordsets[0].length === 0) {
                        resolve({
                            type: 'validation-error',
                            reason: 'County with the given name does not exist'
                        });
                    } else {
                        try {
                            let query1 = `SELECT * FROM [TBENTERPRISE] WHERE COMPANYNAME=@companyName OR COMPANYURL=@companyUrl`;
                            let request = new sql.Request();
                            request.input('companyName', result.value.companyName);
                            request.input('companyUrl', result.value.companyUrl);
                            let res = await request.query(query1);
                            if (res.recordsets[0].length === 0) {
                                try {
                                    let query2: string = `INSERT into [TBENTERPRISE] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE],[CREATEDAT]) 
                                    VALUES(@companyName, @contactPersonsName, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county), @isCorporate,GETDATE());`;
                                    let request = new sql.Request();
                                    request.input('companyName', result.value.companyName);
                                    request.input('contactPersonsName', result.value.contactPersonsName);
                                    request.input('companyUrl', result.value.companyUrl);
                                    request.input('emailAddress', result.value.emailAddress);
                                    request.input('phoneNumber', result.value.phoneNumber);
                                    request.input('county', result.value.county);
                                    request.input('isCorporate', sql.Bit, isCoporate);
                                    await request.query(query2);
                                    resolve({ type: 'success' });
                                } catch (error) {
                                    resolve({
                                        type: 'app-crashed',
                                        reason: error
                                    });
                                }
                            } else {
                                resolve({
                                    type: 'validation-error',
                                    reason: 'Company with the Name or Url already exists',
                                });
                            }

                        } catch (error) {
                            resolve({
                                type: 'app-crashed',
                                reason: error
                            });
                        }
                    }
                } catch (error) {
                    resolve({
                        type: 'app-crashed',
                        reason: error
                    });
                }
            } else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        })
    }

    merchant(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county): Promise<ActivityResponse> {
        return new Promise<ActivityResponse>(async (resolve, reject) => {
            let result = this.validateInput(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county);
            const isCoporate = 0;
            if (result.error == null) {
                try {
                    let query = `SELECT * FROM TBCOUNTIES WHERE NAME=@county`;
                    let request = new sql.Request();
                    request.input('county', county);
                    let res = await request.query(query);
                    if (res.recordsets[0].length === 0) {
                        resolve({
                            type: 'validation-error',
                            reason: 'County with the given name does not exist'
                        });
                    } else {
                        try {
                            let query1 = `SELECT * FROM [TBENTERPRISE] WHERE COMPANYNAME=@companyName OR COMPANYURL=@companyUrl`;
                            let request = new sql.Request();
                            request.input('companyName', result.value.companyName);
                            request.input('companyUrl', result.value.companyUrl);
                            let res = await request.query(query1);
                            if (res.recordsets[0].length === 0) {
                                try {
                                    let query2: string = `INSERT into [TBENTERPRISE] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE],[CREATEDAT]) 
                                    VALUES(@companyName, @contactPersonsName, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county), @isCorporate,GETDATE());`;
                                    let request = new sql.Request();
                                    request.input('companyName', result.value.companyName);
                                    request.input('contactPersonsName', result.value.contactPersonsName);
                                    request.input('companyUrl', result.value.companyUrl);
                                    request.input('emailAddress', result.value.emailAddress);
                                    request.input('phoneNumber', result.value.phoneNumber);
                                    request.input('county', result.value.county);
                                    request.input('isCorporate', sql.Bit, isCoporate);
                                    await request.query(query2);
                                    resolve({ type: 'success' });
                                } catch (error) {
                                    resolve({
                                        type: 'app-crashed',
                                        reason: error
                                    });
                                }
                            } else {
                                resolve({
                                    type: 'validation-error',
                                    reason: 'Company with the Name or Url already exists',
                                });
                            }

                        } catch (error) {
                            resolve({
                                type: 'app-crashed',
                                reason: error
                            });
                        }
                    }
                } catch (error) {
                    resolve({
                        type: 'app-crashed',
                        reason: error
                    });
                }
            } else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        })
    }
}