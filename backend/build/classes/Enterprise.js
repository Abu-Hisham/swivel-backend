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
const Joi = require("joi");
const sql = require("mssql");
class Enterprise {
    constructor() { }
    validateRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user) {
        const schema = Joi.object().keys({
            companyName: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            contactPersonsName: Joi.string().min(3).regex(/^[A-Z a-z]+$/).max(100).required().replace(/\s{2,}/g, ' '),
            companyUrl: Joi.string().max(500).regex(/^(http|https):\/\/[^ "]+$/).required(),
            emailAddress: Joi.string().max(100).email().required(),
            phoneNumber: Joi.string().min(10).regex(/^[0-9]/).max(15).required().replace(/\s{1,}/g, ''),
            county: Joi.string().required().min(3).regex(/^[A-Z a-z]+$/).replace(/\s{2,}/g, ' '),
            user: Joi.alternatives([Joi.string().max(255).email(),
                Joi.string().min(10).max(15).regex(/[0-9]/)]),
        });
        const result = Joi.validate({ companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user }, schema);
        return result;
    }
    validateInput(name, company, companyUrl, emailAddress, phoneNumber, county, monthlyVolumes, averageTransactions, user) {
        const schema = Joi.object().keys({
            name: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            company: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            // contactPersonsName: Joi.string().min(3).regex(/^[A-Z a-z]+$/).max(100).required().replace(/\s{2,}/g, ' '),
            companyUrl: Joi.string().max(500).regex(/^(http|https):\/\/[^ "]+$/).required(),
            emailAddress: Joi.string().max(100).email().required(),
            phoneNumber: Joi.string().min(10).regex(/^[0-9]/).max(15).required().replace(/\s{1,}/g, ''),
            county: Joi.string().required().min(3).regex(/^[A-Z a-z]+$/).replace(/\s{2,}/g, ' '),
            monthlyVolumes: Joi.string().regex(/^[0-9]/).required().replace(/\s{1,}/g, ''),
            averageTransactions: Joi.string().regex(/^\d+(\.\d{1,2})?$/).required().replace(/\s{1,}/g, ''),
            user: Joi.alternatives([Joi.string().max(255).email(),
                Joi.string().min(10).max(15).regex(/[0-9]/)]),
        });
        const result = Joi.validate({ name, company, companyUrl, emailAddress, phoneNumber, county, monthlyVolumes, averageTransactions, user }, schema);
        return result;
    }
    corporateRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user);
            const isCorporate = 1;
            if (result.error == null) {
                try {
                    let query1 = `SELECT * FROM [TBENTERPRISE] WHERE COMPANY=@company OR COMPANYURL=@companyUrl`;
                    let request = new sql.Request();
                    request.input('company', result.value.companyName);
                    request.input('companyUrl', result.value.companyUrl);
                    let res1 = yield request.query(query1);
                    if (res1.recordsets[0].length === 0) {
                        resolve({
                            type: 'validation-error',
                            reason: 'Company with the given Name or URL Does not exist',
                        });
                    }
                    else {
                        try {
                            let query2 = `INSERT into [TBENTERPRISEREQUESTS] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE],[CUSTOMERNO],[CREATEDAT]) 
                                                VALUES(@companyName,@contactPersonsName, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county),@isCorporate,(SELECT ID FROM [TBCUSTOMERS] WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user),GETDATE());`;
                            let request = new sql.Request();
                            request.input('companyName', result.value.companyName);
                            request.input('contactPersonsName', result.value.contactPersonsName);
                            request.input('companyUrl', result.value.companyUrl);
                            request.input('emailAddress', result.value.emailAddress);
                            request.input('phoneNumber', result.value.phoneNumber);
                            request.input('county', result.value.county);
                            request.input('user', result.value.user);
                            request.input('isCorporate', isCorporate);
                            yield request.query(query2);
                            resolve({ type: 'success' });
                        }
                        catch (error) {
                            resolve({
                                type: 'app-crashed',
                                reason: error
                            });
                        }
                    }
                }
                catch (error) {
                    resolve({
                        type: 'app-crashed',
                        reason: error
                    });
                }
            }
            else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        }));
    }
    corporate(name, company, companyUrl, emailAddress, phoneNumber, county, monthlyVolumes, averageTransactions, user) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateInput(name, company, companyUrl, emailAddress, phoneNumber, county, monthlyVolumes, averageTransactions, user);
            const isCorporate = 1;
            if (result.error == null) {
                try {
                    let query1 = `SELECT * FROM TBCOUNTIES WHERE NAME=@county`;
                    let request = new sql.Request();
                    request.input('county', county);
                    let res1 = yield request.query(query1);
                    if (res1.recordsets[0].length === 0) {
                        resolve({
                            type: 'validation-error',
                            reason: 'County with the given name does not exist'
                        });
                    }
                    else {
                        try {
                            let query1 = `SELECT * FROM [TBENTERPRISE] WHERE COMPANY=@company OR COMPANYURL=@companyUrl`;
                            let request = new sql.Request();
                            request.input('company', result.value.company);
                            request.input('companyUrl', result.value.companyUrl);
                            let res = yield request.query(query1);
                            if (res.recordsets[0].length === 0) {
                                try {
                                    let query2 = `INSERT into [TBENTERPRISE] ([NAME],[COMPANY],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[MONTHLYVOLUMES],[AVERAGETRANSACTIONS],[ISCORPORATE],[CUSTOMERNO],[CREATEDAT]) 
                                            VALUES(@name, @company, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county),@monthlyVolumes, @averageTransactions, @isCorporate,(SELECT ID FROM [TBCUSTOMERS] WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user), GETDATE());`;
                                    let request = new sql.Request();
                                    request.input('name', result.value.name);
                                    request.input('company', result.value.company);
                                    request.input('companyUrl', result.value.companyUrl);
                                    request.input('emailAddress', result.value.emailAddress);
                                    request.input('phoneNumber', result.value.phoneNumber);
                                    request.input('county', result.value.county);
                                    request.input('monthlyVolumes', result.value.monthlyVolumes);
                                    request.input('averageTransactions', result.value.averageTransactions);
                                    request.input('isCorporate', sql.Bit, isCorporate);
                                    request.input('user', result.value.user);
                                    yield request.query(query2);
                                    resolve({ type: 'success' });
                                }
                                catch (error) {
                                    resolve({
                                        type: 'app-crashed',
                                        reason: error
                                    });
                                }
                            }
                            else {
                                resolve({
                                    type: 'validation-error',
                                    reason: 'Company with the Name or Url already exists',
                                });
                            }
                        }
                        catch (error) {
                            resolve({
                                type: 'app-crashed',
                                reason: error
                            });
                        }
                    }
                }
                catch (error) {
                    resolve({
                        type: 'app-crashed',
                        reason: error
                    });
                }
            }
            else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        }));
    }
    merchantRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user);
            const isCorporate = 1;
            if (result.error == null) {
                try {
                    let query1 = `SELECT * FROM [TBENTERPRISE] WHERE COMPANY=@company OR COMPANYURL=@companyUrl`;
                    let request = new sql.Request();
                    request.input('company', result.value.companyName);
                    request.input('companyUrl', result.value.companyUrl);
                    let res1 = yield request.query(query1);
                    if (res1.recordsets[0].length === 0) {
                        resolve({
                            type: 'validation-error',
                            reason: 'Company with the given Name or URL Does not exist',
                        });
                    }
                    else {
                        try {
                            let query2 = `INSERT into [TBENTERPRISEREQUESTS] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE],[CUSTOMERNO],[CREATEDAT]) 
                                                VALUES(@companyName,@contactPersonsName, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county),@isCorporate,(SELECT ID FROM [TBCUSTOMERS] WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user),GETDATE());`;
                            let request = new sql.Request();
                            request.input('companyName', result.value.companyName);
                            request.input('contactPersonsName', result.value.contactPersonsName);
                            request.input('companyUrl', result.value.companyUrl);
                            request.input('emailAddress', result.value.emailAddress);
                            request.input('phoneNumber', result.value.phoneNumber);
                            request.input('county', result.value.county);
                            request.input('user', result.value.user);
                            request.input('isCorporate', isCorporate);
                            yield request.query(query2);
                            resolve({ type: 'success' });
                        }
                        catch (error) {
                            resolve({
                                type: 'app-crashed',
                                reason: error
                            });
                        }
                    }
                }
                catch (error) {
                    resolve({
                        type: 'app-crashed',
                        reason: error
                    });
                }
            }
            else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        }));
    }
    merchant(name, company, companyUrl, emailAddress, phoneNumber, county, monthlyVolumes, averageTransactions, user) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateInput(name, company, companyUrl, emailAddress, phoneNumber, county, monthlyVolumes, averageTransactions, user);
            const isCorporate = 1;
            if (result.error == null) {
                try {
                    let query1 = `SELECT * FROM TBCOUNTIES WHERE NAME=@county`;
                    let request = new sql.Request();
                    request.input('county', county);
                    let res1 = yield request.query(query1);
                    if (res1.recordsets[0].length === 0) {
                        resolve({
                            type: 'validation-error',
                            reason: 'County with the given name does not exist'
                        });
                    }
                    else {
                        try {
                            let query1 = `SELECT * FROM [TBENTERPRISE] WHERE COMPANY=@company OR COMPANYURL=@companyUrl`;
                            let request = new sql.Request();
                            request.input('company', result.value.company);
                            request.input('companyUrl', result.value.companyUrl);
                            let res = yield request.query(query1);
                            if (res.recordsets[0].length === 0) {
                                try {
                                    let query2 = `INSERT into [TBENTERPRISE] ([NAME],[COMPANY],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[MONTHLYVOLUMES],[AVERAGETRANSACTIONS],[ISCORPORATE],[CUSTOMERNO],[CREATEDAT]) 
                                            VALUES(@name, @company, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county),@monthlyVolumes, @averageTransactions, @isCorporate,(SELECT ID FROM [TBCUSTOMERS] WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user), GETDATE());`;
                                    let request = new sql.Request();
                                    request.input('name', result.value.name);
                                    request.input('company', result.value.company);
                                    request.input('companyUrl', result.value.companyUrl);
                                    request.input('emailAddress', result.value.emailAddress);
                                    request.input('phoneNumber', result.value.phoneNumber);
                                    request.input('county', result.value.county);
                                    request.input('monthlyVolumes', result.value.monthlyVolumes);
                                    request.input('averageTransactions', result.value.averageTransactions);
                                    request.input('isCorporate', sql.Bit, isCorporate);
                                    request.input('user', result.value.user);
                                    yield request.query(query2);
                                    resolve({ type: 'success' });
                                }
                                catch (error) {
                                    resolve({
                                        type: 'app-crashed',
                                        reason: error
                                    });
                                }
                            }
                            else {
                                resolve({
                                    type: 'validation-error',
                                    reason: 'Company with the Name or Url already exists',
                                });
                            }
                        }
                        catch (error) {
                            resolve({
                                type: 'app-crashed',
                                reason: error
                            });
                        }
                    }
                }
                catch (error) {
                    resolve({
                        type: 'app-crashed',
                        reason: error
                    });
                }
            }
            else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        }));
    }
}
exports.Enterprise = Enterprise;
