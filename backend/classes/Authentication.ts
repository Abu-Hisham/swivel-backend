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

export class Authentication implements IAuthentication {
   private validateLogin(user: string, password: string) {
        const loginSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email().required(),
            Joi.string().min(10).max(15).regex(/[0-9]/).required()]),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        });
       return Joi.validate({ user, password }, loginSchema);
      
    }

   private validateRegistration(firstName: string, lastName: string, otherName: string, mobileNumber: string, emailAddress: string, country: string, dateOfBirth: string, gender: string, nationality: string, nationalID: string, password: string, passwordConfirm: string) {
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

   private validateForgotPassword(user: string) {
        const forgotPasswordSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(), Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{1,}/g, '')]),
        });
      return Joi.validate({ user }, forgotPasswordSchema);
    }

    private validateNewPassword(token: string, password: string, passwordConfirm: string) {
        const newPasswordSchema = Joi.object().keys({
            token: Joi.string().max(255).required().replace(/\s{1,}/g, ''),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, ''),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password')).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().replace(/\s{1,}/g, '')
        });
       return Joi.validate({ token, password, passwordConfirm }, newPasswordSchema);
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
                        let pass_hash = bcrypt.hashSync(result.value.password, saltRounds);
                        if (pass_hash) {

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
                            request.input('passwordHash', pass_hash);
                            await request.query(query);
                            resolve({ type: 'success' });
                        } else {
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
                        let pass = bcrypt.compareSync(result.value.password, res.recordset[0]['PASSWORD']);
                        if (pass) {
                            resolve({ type: 'success' });
                        } else {
                            resolve({
                                type: 'validation-error',
                                reason: 'Wrong Credentials'
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