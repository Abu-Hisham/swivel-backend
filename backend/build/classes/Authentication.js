"use strict";
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
        return new Promise((resolve, reject) => {
            let result = this.validateRegistration(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm);
            if (result.error === null) {
                //-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x
                let query = `SELECT * FROM TBCUSTOMERS WHERE (CUSTOMERNO=@mobileNumber)`;
                let query1 = `SELECT * FROM TBCUSTOMERS WHERE (EMAILADDRESS=@emailAddress)`;
                let query2 = `SELECT * FROM TBCUSTOMERS WHERE (IDENTIFICATIONID=@nationalID)`;
                let request = new sql.Request();
                request.input('mobileNumber', result.value.mobileNumber);
                request.input('emailAddress', result.value.emailAddress);
                request.input('nationalID', result.value.nationalID);
                request.query(query).then((res) => {
                    request.query(query1).then((res1) => {
                        request.query(query2).then((res2) => {
                            let error_msg = ['', '', ''];
                            let index = 0;
                            if (res.recordsets[0].length > 0) {
                                let msg = `Mobile Number ${result.value.mobileNumber}`;
                                error_msg[index] = msg;
                                index++;
                            }
                            if (res1.recordsets[0].length > 0) {
                                let msg = `Email Address ${result.value.emailAddress}`;
                                error_msg[index] = msg;
                                index++;
                            }
                            if (res2.recordsets[0].length > 0) {
                                let msg = `ID Number ${result.value.nationalID}`;
                                error_msg[index] = msg;
                                index++;
                            }
                            if (index === 0) {
                                let DOB = moment(dateOfBirth, 'DD-MM-YYYY').toDate();
                                let passwordHash = passHash.generate(result.value.password);
                                let query = `INSERT into [TBCUSTOMERS] ([FIRSTNAME],[LASTNAME],[OTHERNAMES], [CUSTOMERNO],[EMAILADDRESS],[COUNTRY],[DATEOFBIRTH],[GENDER],[NATIONALITY],[IDENTIFICATIONID],[PASSWORD]) 
                                                     VALUES(@firstName, @lastName, @otherName, @mobileNumber, @emailAddress, @country, @dateOfBirth, @gender, @nationality, @nationalID, @passwordHash);`;
                                let request = new sql.Request();
                                request.input('firstName', result.value.firstName);
                                request.input('lastName', result.value.lastName);
                                request.input('otherName', result.value.otherName);
                                request.input('mobileNumber', result.value.mobileNumber);
                                request.input('emailAddress', result.value.emailAddress);
                                request.input('country', result.value.country);
                                request.input('dateOfBirth', DOB);
                                request.input('gender', result.value.gender);
                                request.input('nationality', result.value.nationality);
                                request.input('nationalID', result.value.nationalID);
                                request.input('passwordHash', passwordHash);
                                request.query(query);
                                resolve({ type: 'success' });
                            }
                            else {
                                let reason = '';
                                error_msg.forEach((value) => {
                                    if (value) {
                                        reason += value + ', ';
                                    }
                                });
                                reject({
                                    type: 'validation-error',
                                    reason: 'User with ' + reason + ' Exist'
                                });
                            }
                        }).catch(() => reject({
                            type: 'app-crashed',
                            reason: 'Database Connection Error'
                        }));
                    }).catch(() => reject({
                        type: 'app-crashed',
                        reason: 'Database Connection Error'
                    }));
                }).catch(() => reject({
                    type: 'app-crashed',
                    reason: 'Database Connection Error'
                }));
                //-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x
            }
            else {
                reject({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        });
    }
    login(user, password) {
        return new Promise((resolve, reject) => {
            let result = this.validateLogin(user, password);
            if (result.error === null) {
                let query = `SELECT PASSWORD FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`;
                let request = new sql.Request();
                request.input('user', result.value.user);
                request.query(query).then((res) => {
                    if (res.recordsets[0].length != 0 && passHash.verify(result.value.password, res.recordset[0]['PASSWORD'])) {
                        resolve({ type: 'success' });
                    }
                    else {
                        reject({
                            type: 'validation-error',
                            reason: 'Wrong Credentials'
                        });
                    }
                }).catch(() => reject({
                    type: 'app-crashed',
                    reason: 'Database Connection Error'
                }));
            }
            else {
                reject({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        });
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
