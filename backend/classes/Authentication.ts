import { IAuthentication } from "../interfaces/IAuthentication";
import { ActivityResponse } from "../models/ActivityResponse";
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
import moment = require('moment');
import sql = require('mssql');
import passHash = require('password-hash');

export class Authentication implements IAuthentication {
    validateLogin(user: string, password: string) {
        const loginSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
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

    async register(firstName: string, lastName: string, otherName: string, mobileNumber: string, emailAddress: string, country: string, dateOfBirth: string, gender: string, nationality: string, nationalID: string, password: string, passwordConfirm: string) {
        let result = this.validateRegistration(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm)
        if (result.error === null) {
            var temp = await this.addUser(result.value.firstName, result.value.lastName, result.value.otherName, result.value.mobileNumber, result.value.emailAddress, result.value.country, result.value.dateOfBirth, result.value.gender, result.value.nationality, result.value.nationalID, result.value.password)
                .then((result) => { console.log(result) })
                .catch((error) => { console.log(error) })
            return temp
        } else {
            return {
                type: 'validation-error',
                reason: result.error
            }
        }
    }

    async addUser(firstName: string, lastName: string, otherName: string, mobileNumber: string, emailAddress: string, country: string, dateOfBirth: string, gender: string, nationality: string, nationalID: string, password: string): Promise<ActivityResponse> {
        let query: string = `SELECT * FROM TBCUSTOMERS WHERE (CUSTOMERNO=@mobileNumber) OR (EMAILADDRESS=@emailAddress) OR (IDENTIFICATIONID=@nationalID)`
        let request = new sql.Request();
        request.input('mobileNumber', mobileNumber)
        request.input('emailAddress', emailAddress)
        request.input('nationalID', nationalID)
        var temp = await request.query(query)
        let results = temp.recordsets[0];
        return new Promise<ActivityResponse>(async (resolve, reject) => {
            if (results.length === 0) {
                let DOB: Date = moment(dateOfBirth, 'DD-MM-YYYY').toDate()
                let passwordHash = passHash.generate(password)
                let query: string = `INSERT into [TBCUSTOMERS] ([FIRSTNAME],[LASTNAME],[OTHERNAMES], [CUSTOMERNO],[EMAILADDRESS],[COUNTRY],[DATEOFBIRTH],[GENDER],[NATIONALITY],[IDENTIFICATIONID],[PASSWORD]) 
                                    VALUES(@firstName, @lastName, @otherName, @mobileNumber, @emailAddress, @country, @dateOfBirth, @gender, @nationality, @nationalID, @passwordHash);`
                let request = new sql.Request();
                request.input('firstName', firstName)
                request.input('lastName', lastName)
                request.input('otherName', otherName)
                request.input('mobileNumber', mobileNumber)
                request.input('emailAddress', emailAddress)
                request.input('country', country)
                request.input('dateOfBirth', DOB)
                request.input('gender', gender)
                request.input('nationality', nationality)
                request.input('nationalID', nationalID)
                request.input('passwordHash', passwordHash)

                await request.query(query);
                resolve({ type: 'success' });
            }
            else {
                reject({
                    type: 'validation-error',
                    reason: "User  with the ID_No|Email|Phone_No Exists"
                })
            }
        })
    }

    async login(user: string, password: string) {
        let result = this.validateLogin(user, password)
        if (result.error === null) {
            let temp = await this.checkUser(result.value.user, result.value.password).then((res)=>{console.log(res)}).catch((err)=>{console.log(err)}) 
            return temp
        } else {
            return {
                type: 'validation-error',
                reason: result.error
            }
        }
    }

    async checkUser(user: string, password: string){
        let query: string = `SELECT PASSWORD FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`
        let request = new sql.Request();
        request.input('user', user)
        let results = await request.query(query);
        return new Promise<ActivityResponse>((resolve, reject)=>{
            if (results.recordsets[0].length != 0 && passHash.verify(password, results.recordset[0]['PASSWORD'])) {
                resolve({ type: 'success' })
            } else {
                reject({
                    type: 'validation-error',
                    reason: 'Wrong Credentials'
                })
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