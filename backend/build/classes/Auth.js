"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const moment = require("moment");
const sql = require("mssql");
const passHash = require("password-hash");
class Auth {
    validateLogin(user, password) {
        let error = {};
        const loginSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
                Joi.string().min(10).max(15).regex(/[0-9]/).required()]),
            password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        });
        Joi.validate({
            user,
            password
        }, loginSchema, (err) => { error = err; });
        return error;
    }
    validation(params) {
        let error = {};
        const schema = Joi.object().keys({
            firstName: Joi.string().min(3).required(),
            lastName: Joi.string().min(3).required(),
            otherName: Joi.string().min(3).required(),
            mobileNumber: Joi.string().min(10).max(15).regex(/[0-9]/).required(),
            emailAddress: Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
            country: Joi.string().required(),
            dateOfBirth: Joi.date().format('DD-MM-YYYY').required(),
            gender: Joi.string().valid(['M', 'F']).required(),
            nationality: Joi.string().min(3).required(),
            nationalID: Joi.string().length(8).regex(/[0-9]{8}/).required(),
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
                Joi.string().min(10).max(15).regex(/[0-9]/).required()]),
            password: Joi.string().min(8)
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .required(),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password'))
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .required()
        });
        params.forEach(element => {
            Joi.validate({ element }, schema, (err) => { error = err; });
        });
        return error;
    }
    validateRegistration(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm) {
        let error = {};
        const registrationSchema = Joi.object().keys({
            firstName: Joi.string().min(3).required(),
            lastName: Joi.string().min(3).required(),
            otherName: Joi.string().min(3).required(),
            mobileNumber: Joi.string().min(10).max(15).regex(/[0-9]/).required(),
            emailAddress: Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
            country: Joi.string().required(),
            dateOfBirth: Joi.date().format('DD-MM-YYYY').required(),
            gender: Joi.string().valid(['M', 'F']).required(),
            nationality: Joi.string().min(3).required(),
            nationalID: Joi.string().length(8).regex(/[0-9]{8}/).required(),
            password: Joi.string().min(8)
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .required(),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password'))
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .required()
        });
        Joi.validate({
            firstName,
            lastName,
            otherName,
            mobileNumber,
            emailAddress,
            country,
            dateOfBirth,
            gender,
            nationality,
            nationalID,
            password,
            passwordConfirm
        }, registrationSchema, (err) => { error = err; });
        return error;
    }
    validateForgotPassword(user) {
        let error = {};
        const forgotPasswordSchema = Joi.object().keys({
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
                Joi.string().min(10).max(15).regex(/[0-9]/).required()]),
        });
        Joi.validate({
            user
        }, forgotPasswordSchema, (err) => { error = err; });
        return error;
    }
    validateNewPassword(token, password, passwordConfirm) {
        let error = {};
        const newPasswordSchema = Joi.object().keys({
            token: Joi.string().max(255).required(),
            password: Joi.string().min(8)
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .required(),
            passwordConfirm: Joi.string().min(8).valid(Joi.ref('password'))
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .required()
        });
        Joi.validate({
            token,
            password,
            passwordConfirm
        }, newPasswordSchema, (err) => { error = err; });
        return error;
    }
    register(firstName, lastName, otherName, mobileNumber, emailAddress, country, dateOfBirth, gender, nationality, nationalID, password, passwordConfirm) {
        let params = [
            firstName,
            lastName,
            otherName,
            mobileNumber,
            emailAddress,
            country,
            dateOfBirth,
            gender,
            nationality,
            nationalID,
            password,
            passwordConfirm
        ];
        let result = this.validation(params);
        if (result === null) {
            let DOB = moment(dateOfBirth, 'DD-MM-YYYY').toDate();
            let passwordHash = passHash.generate(password);
            let query = `INSERT into [TBCUSTOMERS] (
                [FIRSTNAME], 
                [LASTNAME],
                [OTHERNAMES], 
                [CUSTOMERNO],
                [EMAILADDRESS], 
                [COUNTRY], 
                [DATEOFBIRTH], 
                [GENDER],  
                [NATIONALITY],
                [IDENTIFICATIONID],
                [PASSWORD]) VALUES(
                    @firstName,
                    @lastName,
                    @otherName,
                    @mobileNumber,
                    @emailAddress,
                    @country,
                    @dateOfBirth,
                    @gender,
                    @nationality,
                    @nationalID,
                    @passwordHash);`;
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
            request.query(query, (err, resultset) => {
                if (resultset) {
                    console.log('Query Successful', resultset);
                }
                else {
                    console.log('Error in query', err);
                }
            });
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
    login(user, password) {
        let result = this.validateLogin(user, password);
        if (result === null) {
            let query = `SELECT PASSWORD FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`;
            let request = new sql.Request();
            request.input('user', user);
            request.query(query, (err, resultset) => {
                if (resultset.recordset.length != 0 && passHash.verify(password, resultset.recordset[0]['PASSWORD'])) {
                    console.log('Login successful');
                }
                else {
                    console.log('Wrong Credentials');
                }
            });
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
    forgotPassword(user) {
        let result = this.validateForgotPassword(user);
        if (result === null) {
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
        if (result === null) {
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
}
exports.Auth = Auth;
// var auth = new Authentication()
// console.log(auth.register("Abdulaziz", "31672609", "0701633016", "abdul@gmail.com", "Zizahry@123", "Zizahry@123"))
// console.log(auth.login("070163301","Zizahry@123"))
