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
    validateInput(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county) {
        const schema = Joi.object().keys({
            companyName: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            contactPersonsName: Joi.string().min(3).regex(/^[A-Z a-z]+$/).max(100).required().replace(/\s{2,}/g, ' '),
            companyUrl: Joi.string().max(500).regex(/^(http|https):\/\/[^ "]+$/).required(),
            emailAddress: Joi.string().max(100).email({ minDomainAtoms: 2 }).required(),
            phoneNumber: Joi.string().min(10).regex(/^[0-9]/).max(15).required().replace(/\s{1,}/g, ''),
            county: Joi.string().required().min(3).regex(/^[A-Z a-z]+$/).replace(/\s{2,}/g, ' ')
        });
        const result = Joi.validate({ companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county }, schema);
        return result;
    }
    corporate(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = this.validateInput(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county);
            const isCoporate = 1;
            if (result.error == null) {
                let temp = yield this.saveEnterprise(result.value.companyName, result.value.contactPersonsName, result.value.companyUrl, result.value.emailAddress, result.value.phoneNumber, result.value.county, isCoporate)
                    .then((res) => { console.log(res); }).catch((error) => { console.log(error); });
                return temp;
            }
            else {
                return {
                    type: 'validation-error',
                    reason: result.error
                };
            }
        });
    }
    merchant(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = this.validateInput(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county);
            const isCoporate = 0;
            if (result.error == null) {
                let temp = yield this.saveEnterprise(result.value.companyName, result.value.contactPersonsName, result.value.companyUrl, result.value.emailAddress, result.value.phoneNumber, result.value.county, isCoporate)
                    .then((res) => { console.log(res); }).catch((error) => { console.log(error); });
                return temp;
            }
            else {
                return {
                    type: 'validation-error',
                    reason: result.error
                };
            }
        });
    }
    checkCounty(county) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT * FROM TBCOUNTIES WHERE NAME=@county`;
            let request = new sql.Request();
            request.input('county', county);
            let temp = yield request.query(query);
            let result = temp.recordsets;
            if (result.length === 0) {
                throw {
                    type: 'validation-error',
                    reason: 'County with the given name does not exist'
                };
            }
            else {
                return { type: 'success' };
            }
        });
    }
    saveEnterprise(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county, isCoporate) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT * FROM [TBENTERPRISE] WHERE COMPANYNAME=@companyName OR COMPANYURL=@companyUrl`;
            let request = new sql.Request();
            request.input('companyName', companyName);
            request.input('companyUrl', companyUrl);
            let temp = yield request.query(query);
            let result = temp.recordsets[0];
            let countyExist = yield this.checkCounty(county);
            if (result.length === 0 && countyExist.type === 'success') {
                let query = `INSERT into [TBENTERPRISE] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE],[CREATEDAT]) 
                                            VALUES(@companyName, @contactPersonsName, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county), @isCorporate,GETDATE());`;
                let request = new sql.Request();
                request.input('companyName', companyName);
                request.input('contactPersonsName', contactPersonsName);
                request.input('companyUrl', companyUrl);
                request.input('emailAddress', emailAddress);
                request.input('phoneNumber', phoneNumber);
                request.input('county', county);
                request.input('isCorporate', sql.Bit, isCoporate);
                yield request.query(query);
                return { type: 'success' };
            }
            else {
                throw {
                    type: 'validation-error',
                    reason: 'Company with the Name or Url already exists',
                };
            }
        });
    }
}
exports.Enterprise = Enterprise;
