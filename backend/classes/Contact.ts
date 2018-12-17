import { ActivityResponse } from "../models/ActivityResponse";
import Joi = require('joi');
import { IContactUs } from "../interfaces/IContactUs";
import sql = require('mssql');


export class Contact implements IContactUs {
    constructor() { }
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
    
    contactForm(name: string, email: string, subject: string, message: string, user: string): ActivityResponse {
        let result = this.validateInput(name, email, subject, message, user)
        if (result.error === null) {
            this.userExists(user)
                .then((res) => {
                    if (res === true) {
                        let query: string = `INSERT into TBCONTACTMESSAGES(Name, Email, Subject, Message, RegisteredUserID, SentAt) 
                                             VALUES(@name, @email, @subject, @message,(SELECT ID FROM TBCUSTOMERS WHERE EMAILADDRESS=@user OR CUSTOMERNO=@user),GETDATE());`
                        let request = new sql.Request();
                        request.input('name', result.value.name)
                        request.input('email', result.value.email)
                        request.input('subject', result.value.subject)
                        request.input('message', result.value.message)
                        request.input('user', result.value.user)
                        request.query(query, (err, resultset) => {
                            if (resultset) {
                                console.log('Query Successful', resultset)
                            } else {
                                console.log('Error in query', err)
                            }
                        })
                    } else {
                        console.log(`User ${user} doesn't Exist`)
                    }
                })
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
    async userExists(user: string): Promise<boolean> {
        let userExists: boolean;
        let query: string = `SELECT * FROM TBCUSTOMERS WHERE CUSTOMERNO=@user OR EMAILADDRESS=@user`
        let request = new sql.Request();
        request.input('user', user)
        var temp = await request.query(query)
        let results = temp.recordsets[0];
        if (results.length === 0) {
            userExists = false;
            return userExists;
        }
        else {
            userExists = true;
            return userExists;
        }
    }
}