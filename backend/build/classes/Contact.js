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
class Contact {
    constructor() { }
    validateInput(name, email, subject, message, user) {
        const schema = Joi.object().keys({
            name: Joi.string().min(3).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            subject: Joi.string().min(3).max(255).required().replace(/\s{2,}/g, ' '),
            message: Joi.string().min(3).required().replace(/\s{2,}/g, ' '),
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
                Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{2,}/g, ' ')])
        });
        const result = Joi.validate({ name, email, subject, message, user }, schema);
        return result;
    }
    contactForm(name, email, subject, message, user) {
        let result = this.validateInput(name, email, subject, message, user);
        if (result.error === null) {
            this.userExists(user)
                .then((res) => {
                if (res === true) {
                    let query = `INSERT into TBCONTACTMESSAGES(Name, Email, Subject, Message, RegisteredUserID, SentAt) 
                                             VALUES(@name, @email, @subject, @message,(SELECT ID FROM TBCUSTOMERS WHERE EMAILADDRESS=@user OR CUSTOMERNO=@user),GETDATE());`;
                    let request = new sql.Request();
                    request.input('name', result.value.name);
                    request.input('email', result.value.email);
                    request.input('subject', result.value.subject);
                    request.input('message', result.value.message);
                    request.input('user', result.value.user);
                    request.query(query, (err, resultset) => {
                        if (resultset) {
                            console.log('Query Successful', resultset);
                        }
                        else {
                            console.log('Error in query', err);
                        }
                    });
                }
                else {
                    console.log(`User ${user} doesn't Exist`);
                }
            });
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
    userExists(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let userExists;
            let query = `SELECT * FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`;
            let request = new sql.Request();
            request.input('user', user);
            var temp = yield request.query(query);
            let results = temp.recordsets[0];
            if (results.length === 0) {
                userExists = false;
                return userExists;
            }
            else {
                userExists = true;
                return userExists;
            }
        });
    }
}
exports.Contact = Contact;
