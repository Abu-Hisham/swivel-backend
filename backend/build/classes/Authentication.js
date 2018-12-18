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
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const moment = require("moment");
const sql = require("mssql");
const passHash = require("password-hash");
class Authentication {
    validateLogin(user, password) {
        const loginSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
                Joi.string().min(10).max(15).regex(/[0-9]/).required()]),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        });
        const result = Joi.validate({ user, password }, loginSchema);
        return result;
    }
    validateRegistration(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm) {
        const registrationSchema = Joi.object().keys({
            firstName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            lastName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            otherName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            mobileNumber: Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{1,}/g, ''),
            emailAddress: Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
            country: Joi.string().required().replace(/\s{1,}/g, ''),
            dateOfBirth: Joi.date().format('DD-MM-YYYY').required(),
            gender: Joi.string().valid(['M', 'F']).required(),
            nationality: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            nationalID: Joi.string().length(8).regex(/[0-9]{8}/).required().replace(/\s{1,}/g, ''),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, ''),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password')).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, '')
        });
        const result = Joi.validate({ firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm }, registrationSchema);
        return result;
    }
    validateForgotPassword(user) {
        const forgotPasswordSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(), Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{1,}/g, '')]),
        });
        const result = Joi.validate({ user }, forgotPasswordSchema);
        return result;
    }
    validateNewPassword(token, password, passwordConfirm) {
        const newPasswordSchema = Joi.object().keys({
            token: Joi.string().max(255).required().replace(/\s{1,}/g, ''),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, ''),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password')).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, '')
        });
        const result = Joi.validate({ token, password, passwordConfirm }, newPasswordSchema);
        return result;
    }
    register(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm) {
        let result = this.validateRegistration(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm);
        var temp;
        if (result.error === null) {
            var ut = this.addUser(result.value.firstName, result.value.lastName, result.value.otherName, result.value.mobileNumber, result.value.emailAddress, result.value.country, result.value.dateOfBirth, result.value.gender, result.value.nationality, result.value.nationalID, result.value.password)
                .then((res) => {
                temp = res;
                // return temp
            })
                .catch((error) => {
                temp = error;
                // return temp
            });
            console.log('Result');
            console.log(ut);
        }
        else {
            return {
                type: 'validation-error',
                reason: result.error
            };
        }
    }
    addUser(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT * FROM TBCUSTOMERS WHERE CUSTOMERNO=@mobileNumber OR EMAILADDRESS=@emailAddress`;
            let request = new sql.Request();
            request.input('mobileNumber', mobileNumber);
            request.input('emailAddress', emailAddress);
            var temp = yield request.query(query);
            let userExists;
            let results = temp.recordsets[0];
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (results.length === 0) {
                    let DOB = moment(dateOfBirth, 'DD-MM-YYYY').toDate();
                    let passwordHash = passHash.generate(password);
                    let query = `INSERT into [TBCUSTOMERS] ([FIRSTNAME],[LASTNAME],[OTHERNAMES], [CUSTOMERNO],[EMAILADDRESS],[COUNTRY],[DATEOFBIRTH],[GENDER],[NATIONALITY],[IDENTIFICATIONID],[PASSWORD]) 
                                    VALUES(@firstName, @lastName, @otherName, @mobileNumber, @emailAddress, @country, @dateOfBirth, @gender, @nationality, @nationalID, @passwordHash);`;
                    let request = new sql.Request();
                    request.input('firstName', firstName);
                    request.input('lastName', lastName);
                    request.input('otherName', otherName);
                    request.input('mobileNumber', mobileNumber);
                    request.input('emailAddress', emailAddress);
                    request.input('country', country);
                    request.input('dateOfBirth', DOB);
                    request.input('gender', gender);
                    request.input('nationality', nationality);
                    request.input('nationalID', nationalID);
                    request.input('passwordHash', passwordHash);
                    yield request.query(query);
                    resolve({ type: 'success' });
                }
                else {
                    reject({
                        type: 'validation-error',
                        reason: "User Exists already"
                    });
                }
            }));
        });
    }
    login(user, password) {
        let result = this.validateLogin(user, password);
        if (result.error === null) {
            let query = `SELECT PASSWORD FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`;
            let request = new sql.Request();
            request.input('user', result.value.user);
            request.query(query, (err, resultset) => {
                if (resultset.recordset.length != 0 && passHash.verify(result.value.password, resultset.recordset[0]['PASSWORD'])) {
                    return {
                        type: 'success'
                    };
                }
                else {
                    return {
                        type: 'validation-error',
                        reason: 'Wrong Credentials'
                    };
                }
            });
        }
        else {
            return {
                type: 'validation-error',
                reason: result.error
            };
        }
    }
    forgotPassword(user) {
        let result = this.validateForgotPassword(user);
        if (result.error === null) {
            return {
                type: 'success'
            };
        }
        else {
            return {
                type: 'validation-error',
                reason: result
            };
        }
    }
    newPassword(token, password, passwordConfirm) {
        let result = this.validateNewPassword(token, password, passwordConfirm);
        if (result.error === null) {
            return {
                type: 'success'
            };
        }
        else {
            return {
                type: 'validation-error',
                reason: result.error
            };
        }
    }
}
exports.Authentication = Authentication;
