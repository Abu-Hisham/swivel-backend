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
    constructor() {
        this.counties = [
            'Mombasa County', 'Kwale County', 'Kilifi County', 'Tana River County', 'Lamu County', 'Taita Taveta County',
            'Garissa County', 'Wajir County', 'Mandera County', 'Marsabit County', 'Isiolo County', 'Meru County',
            'Tharaka Nithi County', 'Embu County', 'Kitui County', 'Machakos County', 'Makueni County', 'Nyandarua County',
            'Nyeri County', 'Kirinyaga County', 'Murang\'a County', 'Kiambu County', 'Turkana County', 'West Pokot County',
            'Siaya County', 'Trans Nzoia County', 'Uasin Gishu County', 'Elgeyo Marakwet County', 'Nandi County',
            'Baringo County', 'Laikipia County', 'Nakuru County', 'Narok County', 'Kajiado County', 'Kericho County',
            'Bomet County', 'Kakamega County', 'Vihiga County', 'Bungoma County', 'Busia County', 'Kisumu County',
            'Homabay County', 'Migori County', 'Kisii County', 'Nyamira County', 'Nairobi County', 'Samburu County'
        ];
    }
    validateRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user) {
        const schema = Joi.object().keys({
            companyName: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            contactPersonsName: Joi.string().min(3).regex(/^[A-Z a-z]+$/).max(100).required().replace(/\s{2,}/g, ' '),
            companyUrl: Joi.string().max(500).regex(/^((http|https):\/\/)?[^ "]+$/).required(),
            emailAddress: Joi.string().max(100).email().required(),
            phoneNumber: Joi.string().min(10).regex(/^[0-9]/).max(15).required().replace(/\s{1,}/g, ''),
            county: Joi.string().required().regex(RegExp(`^(${this.counties.join('|')})$`)),
            user: Joi.any().allow('')
        });
        return Joi.validate({ companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user }, schema);
    }
    validateInput(name, company, companyUrl, emailAddress, phoneNumber, county, monthlyVolumes, averageTransactions, user) {
        const schema = Joi.object().keys({
            name: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            company: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            companyUrl: Joi.string().max(500).regex(/^((http|https):\/\/)?[^ "]+$/).required(),
            emailAddress: Joi.string().max(100).email().required(),
            phoneNumber: Joi.string().min(10).regex(/^[0-9]/).max(15).required().replace(/\s{1,}/g, ''),
            county: Joi.string().required().min(3).regex(/^[A-Z a-z]+$/).replace(/\s{2,}/g, ' '),
            monthlyVolumes: Joi.string().regex(/^[0-9]/).required().replace(/\s{1,}/g, ''),
            averageTransactions: Joi.string().regex(/^\d+(\.\d{1,2})?$/).required().replace(/\s{1,}/g, ''),
            user: Joi.any().allow('')
        });
        return Joi.validate({ name, company, companyUrl, emailAddress, phoneNumber, county, monthlyVolumes, averageTransactions, user }, schema);
    }
    corporateRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user);
            const isCorporate = 1;
            if (result.error == null) {
                try {
                    let query2 = `INSERT into [TBENTERPRISEREQUESTS] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE],[CUSTOMERNO],[CREATEDAT]) 
                                          VALUES(@companyName,@contactPersonsName, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county),@isCorporate,(SELECT IDENTIFICATIONID FROM [TBCUSTOMERS] WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user),GETDATE());`;
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
                    reason: result.error
                });
            }
        }));
    }
    merchantRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateRequest(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, user);
            const isCorporate = 0;
            if (result.error == null) {
                try {
                    let query2 = `INSERT into [TBENTERPRISEREQUESTS] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE],[CUSTOMERNO],[CREATEDAT]) 
                                                VALUES(@companyName,@contactPersonsName, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county),@isCorporate,(SELECT IDENTIFICATIONID FROM [TBCUSTOMERS] WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user),GETDATE());`;
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
            const isCorporate = 0;
            if (result.error == null) {
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
                    reason: result.error
                });
            }
        }));
    }
}
exports.Enterprise = Enterprise;
