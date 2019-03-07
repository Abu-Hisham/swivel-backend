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
const DBConnection_1 = require("./DBConnection");
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const moment = require("moment");
const sql = require("mssql");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const counties = [
    'Mombasa County', 'Kwale County', 'Kilifi County', 'Tana River County', 'Lamu County', 'Taita Taveta County',
    'Garissa County', 'Wajir County', 'Mandera County', 'Marsabit County', 'Isiolo County', 'Meru County',
    'Tharaka Nithi County', 'Embu County', 'Kitui County', 'Machakos County', 'Makueni County', 'Nyandarua County',
    'Nyeri County', 'Kirinyaga County', 'Murang A County', 'Kiambu County', 'Turkana County', 'West Pokot County',
    'Siaya County', 'Trans Nzoia County', 'Uasin Gishu County', 'Elgeyo Marakwet County', 'Nandi County',
    'Baringo County', 'Laikipia County', 'Nakuru County', 'Narok County', 'Kajiado County', 'Kericho County',
    'Bomet County', 'Kakamega County', 'Vihiga County', 'Bungoma County', 'Busia County', 'Kisumu County',
    'Homabay County', 'Migori County', 'Kisii County', 'Nyamira County', 'Nairobi County', 'Samburu County'
];
class Authentication {
    validateLogin(user, password) {
        const loginSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email().required(),
                Joi.string().min(10).max(15).regex(/[0-9]/).required()]),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        });
        return Joi.validate({ user, password }, loginSchema);
    }
    validateRegistration(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm) {
        const registrationSchema = Joi.object().keys({
            firstName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            lastName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            otherName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            mobileNumber: Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{1,}/g, ''),
            emailAddress: Joi.string().max(255).email().required(),
            country: Joi.string().required().replace(/\s{1,}/g, ''),
            dateOfBirth: Joi.date().format('DD-MM-YYYY').required(),
            gender: Joi.string().valid(['M', 'F']).required(),
            nationality: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            nationalID: Joi.string().length(8).regex(/[0-9]{8}/).required().replace(/\s{1,}/g, ''),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, ''),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password')).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, '')
        });
        return Joi.validate({ firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm }, registrationSchema);
    }
    validateUpdate(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, userID) {
        const registrationSchema = Joi.object().keys({
            firstName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            lastName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            otherName: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            mobileNumber: Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{1,}/g, ''),
            emailAddress: Joi.string().max(255).email().required(),
            country: Joi.string().required().replace(/\s{1,}/g, ''),
            dateOfBirth: Joi.date().format('DD-MM-YYYY').required(),
            gender: Joi.string().valid(['M', 'F']).required(),
            nationality: Joi.string().min(3).required().replace(/\s{1,}/g, ''),
            nationalID: Joi.string().length(8).regex(/[0-9]{8}/).required().replace(/\s{1,}/g, ''),
            userID: Joi.string().regex(/[0-9]/).required().replace(/\s{1,}/g, '')
        });
        return Joi.validate({ firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, userID }, registrationSchema);
    }
    validateForgotPassword(user) {
        const forgotPasswordSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(), Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{1,}/g, '')]),
        });
        return Joi.validate({ user }, forgotPasswordSchema);
    }
    validateNewPassword(token, password, passwordConfirm) {
        const newPasswordSchema = Joi.object().keys({
            token: Joi.string().max(255).required().replace(/\s{1,}/g, ''),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, ''),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password')).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, '')
        });
        return Joi.validate({ token, password, passwordConfirm }, newPasswordSchema);
    }
    register(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateRegistration(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm);
            if (result.error === null) {
                try {
                    let query = `SELECT * FROM TBCUSTOMERS WHERE (CUSTOMERNO=@mobileNumber)`;
                    let query1 = `SELECT * FROM TBCUSTOMERS WHERE (EMAILADDRESS=@emailAddress)`;
                    let query2 = `SELECT * FROM TBCUSTOMERS WHERE (IDENTIFICATIONID=@nationalID)`;
                    let request = new sql.Request(DBConnection_1.dbconnection);
                    request.input('mobileNumber', result.value.mobileNumber);
                    request.input('emailAddress', result.value.emailAddress);
                    request.input('nationalID', result.value.nationalID);
                    let res = yield request.query(query);
                    let res1 = yield request.query(query1);
                    let res2 = yield request.query(query2);
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
                        let pass_hash = bcrypt.hashSync(result.value.password, saltRounds);
                        if (pass_hash) {
                            let DOB = moment(dateOfBirth, 'DD-MM-YYYY').toDate();
                            let query = `INSERT into [TBCUSTOMERS] ([FIRSTNAME],[LASTNAME],[OTHERNAMES], [CUSTOMERNO],[EMAILADDRESS],[COUNTRY],[DATEOFBIRTH],[GENDER],[NATIONALITY],[IDENTIFICATIONID],[PASSWORD]) 
                                                                VALUES(@firstName, @lastName, @otherName, @mobileNumber, @emailAddress, @country, @dateOfBirth, @gender, @nationality, @nationalID, @passwordHash);`;
                            let request = new sql.Request(DBConnection_1.dbconnection);
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
                            request.input('passwordHash', pass_hash);
                            yield request.query(query);
                            resolve({ type: 'success' });
                        }
                        else {
                            resolve({
                                type: 'app-crashed',
                                reason: pass_hash.error
                            });
                        }
                    }
                    else {
                        let reason = '';
                        error_msg.forEach((value) => {
                            if (value) {
                                reason += value + ', ';
                            }
                        });
                        resolve({
                            type: 'validation-error',
                            reason: 'User with ' + reason + ' Exists'
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
            else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        }));
    }
    updateUser(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, userID) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateUpdate(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, userID);
            if (result.error === null) {
                try {
                    let query = `SELECT * FROM [TBCUSTOMERS] WHERE [ID]=@userID`;
                    let request = new sql.Request(DBConnection_1.dbconnection);
                    request.input('userID', result.value.userID);
                    let res = yield request.query(query);
                    if (res.recordsets[0].length > 0) {
                        let DOB = moment(dateOfBirth, 'DD-MM-YYYY').toDate();
                        let query1 = `UPDATE [TBCUSTOMERS] set [FIRSTNAME]=@firstName,[LASTNAME]=@lastName,[OTHERNAMES]=@otherName, [CUSTOMERNO]=@mobileNumber,[EMAILADDRESS]=@emailAddress,[COUNTRY]=@country,[DATEOFBIRTH]=@dateOfBirth,[GENDER]=@gender,[NATIONALITY]=@nationality,[IDENTIFICATIONID]=@nationalID WHERE [ID]=@userID `;
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
                        yield request.query(query1);
                        resolve({ type: 'success' });
                    }
                    else {
                        resolve({
                            type: 'validation-error',
                            reason: 'User with the given ID doesnt Exist'
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
            else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        }));
    }
    login(user, password) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let result = this.validateLogin(user, password);
            if (result.error === null) {
                try {
                    let query = `SELECT PASSWORD FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`;
                    let request = new sql.Request(DBConnection_1.dbconnection);
                    request.input('user', result.value.user);
                    let res = yield request.query(query);
                    if (res.recordsets[0].length != 0) {
                        let pass = bcrypt.compareSync(result.value.password, res.recordset[0]['PASSWORD']);
                        if (pass) {
                            resolve({ type: 'success' });
                        }
                        else {
                            resolve({
                                type: 'validation-error',
                                reason: 'Wrong Credentials'
                            });
                        }
                    }
                    else {
                        resolve({
                            type: 'validation-error',
                            reason: 'Invalid User'
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
            else {
                resolve({
                    type: 'validation-error',
                    reason: result.error
                });
            }
        }));
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
