import { IAuthentication } from "../interfaces/IAuthentication";
import { ActivityResponse } from "../models/ActivityResponse";
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
import moment = require('moment');
import sql = require('mssql');
import passHash = require('password-hash');
const bcrypt = require('bcrypt');
const saltRounds = 10;

export class Authentication implements IAuthentication {
    validateLogin(user: string, password: string) {
        const loginSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email().required(),
            Joi.string().min(10).max(15).regex(/[0-9]/).required()]),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        });
        const result = Joi.validate({ user, password }, loginSchema);
        return result;
    }

    validateRegistration(firstName: string, lastName: string, otherName: string, mobileNumber: string, emailAddress: string, country: string, dateOfBirth: string, gender: string, nationality: string, nationalID: string, password: string, passwordConfirm: string) {
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
        const result = Joi.validate({ firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm }, registrationSchema);
        return result;
    }

    validateForgotPassword(user: string) {
        const forgotPasswordSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(), Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{1,}/g, '')]),
        });
        const result = Joi.validate({ user }, forgotPasswordSchema);
        return result;
    }

    validateNewPassword(token: string, password: string, passwordConfirm: string) {
        const newPasswordSchema = Joi.object().keys({
            token: Joi.string().max(255).required().replace(/\s{1,}/g, ''),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, ''),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password')).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, '')
        });
        const result = Joi.validate({ token, password, passwordConfirm }, newPasswordSchema);
        return result;
    }

    register(firstName: string, lastName: string, otherName: string, mobileNumber: string, emailAddress: string, country: string, dateOfBirth: string, gender: string, nationality: string, nationalID: string, password: string, passwordConfirm: string): Promise<ActivityResponse> {
        return new Promise<ActivityResponse>(async (resolve, reject) => {
            let result = this.validateRegistration(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm);
            if (result.error === null) {
                try {
                    let query: string = `SELECT * FROM TBCUSTOMERS WHERE (CUSTOMERNO=@mobileNumber)`;
                    let query1: string = `SELECT * FROM TBCUSTOMERS WHERE (EMAILADDRESS=@emailAddress)`;
                    let query2: string = `SELECT * FROM TBCUSTOMERS WHERE (IDENTIFICATIONID=@nationalID)`;
                    let request = new sql.Request();
                    request.input('mobileNumber', result.value.mobileNumber);
                    request.input('emailAddress', result.value.emailAddress);
                    request.input('nationalID', result.value.nationalID);
                    let res = await request.query(query);
                    let res1 = await request.query(query1);
                    let res2 = await request.query(query2);
                    let error_msg: string[] = ['', '', ''];
                    let index: number = 0;
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
                        bcrypt.hash(result.value.password, saltRounds, async (err, hash) => {
                            if (hash) {
                                try {
                                        let DOB: Date = moment(dateOfBirth, 'DD-MM-YYYY').toDate();
                                        let query: string = `INSERT into [TBCUSTOMERS] ([FIRSTNAME],[LASTNAME],[OTHERNAMES], [CUSTOMERNO],[EMAILADDRESS],[COUNTRY],[DATEOFBIRTH],[GENDER],[NATIONALITY],[IDENTIFICATIONID],[PASSWORD]) 
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
                                        request.input('passwordHash', hash);
                                        await request.query(query);
                                        resolve({ type: 'success' });
                                } catch (error) {
                                        resolve({
                                            type: 'app-crashed',
                                            reason: error
                                        });
                                }
                            } else {
                                resolve({
                                    type: 'app-crashed',
                                    reason: err
                                });
                            }

                        });
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
                } catch (error) {
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
        });
    }

    login(user: string, password: string): Promise<ActivityResponse> {
        return new Promise<ActivityResponse>(async (resolve, reject) => {
            let result = this.validateLogin(user, password);
            if (result.error === null) {
                try {
                    let query: string = `SELECT PASSWORD FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`;
                    let request = new sql.Request();
                    request.input('user', result.value.user);
                    let res = await request.query(query);
                        if (res.recordsets[0].length != 0) {
                            try {
                                    let pass = bcrypt.compare(result.value.password, res.recordset[0]['PASSWORD']);
                                    if (pass) {
                                        resolve({ type: 'success' });
                                    } else {
                                        resolve({
                                            type: 'validation-error',
                                            reason: 'Wrong Credentials'
                                        });
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
                                reason: 'Invalid User'
                            });
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

    forgotPassword(user: string): ActivityResponse {
        let result = this.validateForgotPassword(user)
        if (result.error === null) {
            return {
                type: 'success'
            }
        } else {
            return {
                type: 'validation-error',
                reason: result
            }
        }
    }

    newPassword(token: string, password: string, passwordConfirm: string): ActivityResponse {
        let result = this.validateNewPassword(token, password, passwordConfirm)
        if (result.error === null) {
            return {
                type: 'success'
            }
        } else {
            return {
                type: 'validation-error',
                reason: result.error
            }
        }
    }
}