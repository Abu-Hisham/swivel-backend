import { ActivityResponse } from "../models/ActivityResponse";
import Joi = require('joi');
import { IContactUs } from "../interfaces/IContactUs";
import sql = require('mssql');


export class Contact implements IContactUs {
    constructor() {}
    validateInput(name: string, email: string, subject: string, message: string, user: string) {
        const schema = Joi.object().keys({
            name: Joi.string().min(3).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            subject: Joi.string().min(3).max(255).required().replace(/\s{2,}/g, ' '),
            message: Joi.string().min(3).required().replace(/\s{2,}/g, ' '),
            user: Joi.alternatives([Joi.string().max(255).email({ minDomainAtoms: 2 }).required(),
            Joi.string().min(10).max(15).regex(/[0-9]/).required().replace(/\s{2,}/g, ' ')])
        });
        const result = Joi.validate({ name, email, subject, message, user }, schema);
        return result
    }

   contactForm(name: string, email: string, subject: string, message: string, user: string) {
        let result = this.validateInput(name, email, subject, message, user)
        if (result.error === null) {
            return this.saveForm(result.value.name, result.value.email, result.value.subject, result.value.message, result.value.user).then().catch()
        } else {
            return {
                type: 'validation-error',
                reason: result.error
            }
        }
    }
    async saveForm(name: string, email: string, subject: string, message: string, user: string): Promise<ActivityResponse> {
        let userExists: boolean;
        let query: string = `SELECT * FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`
        let request = new sql.Request();
        request.input('user', user)
        var temp = await request.query(query)
        let results = temp.recordsets[0];
        return new Promise<ActivityResponse>(async (reject, resolve) => {
            if (results.length === 0) {
                let query: string = `INSERT into TBCONTACTMESSAGES(Name, Email, Subject, Message, RegisteredUserID, SentAt) 
                                     VALUES(@name, @email, @subject, @message,(SELECT ID FROM TBCUSTOMERS WHERE EMAILADDRESS=@user OR CUSTOMERNO=@user),GETDATE());`
                let request = new sql.Request();
                request.input('name', name)
                request.input('email', email)
                request.input('subject', subject)
                request.input('message', message)
                request.input('user', user)
                await request.query(query);
                resolve({ type: 'success' })
            }
            else {
                reject({
                    type: 'validation-error',
                    reason: 'Invalid User'
                })
            }
        })
    }
}