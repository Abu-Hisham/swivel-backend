import { ActivityResponse } from "../models/ActivityResponse";
import Joi = require('joi');
import { IContactUs } from "../interfaces/IContactUs";
import sql = require('mssql');


export class Contact implements IContactUs {
    constructor() { }
    private validateInput(name: string, email: string, subject: string, message: string, user: string) {
        const schema = Joi.object().keys({
            name: Joi.string().min(3).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            email: Joi.string().email().required(),
            subject: Joi.string().min(3).max(255).required().replace(/\s{2,}/g, ''),
            message: Joi.string().min(3).required().replace(/\s{2,}/g, ' '),
            user: Joi.any().allow('')
        });
        return Joi.validate({ name, email, subject, message, user }, schema);
    }

    contactForm(name: string, email: string, subject: string, message: string, user: string): Promise<ActivityResponse> {
        return new Promise<ActivityResponse>(async (resolve) => {
            let result = this.validateInput(name, email, subject, message, user);
            if (result.error === null) {
                        try {
                            let query: string = `INSERT into TBCONTACTMESSAGES(Name, Email, Subject, Message, RegisteredUserID, SentAt) 
                                                 VALUES(@name, @email, @subject, @message,(SELECT [IDENTIFICATIONID] FROM [TBCUSTOMERS] WHERE [EMAILADDRESS]=@user OR [CUSTOMERNO]=@user),GETDATE());`;
                            let request = new sql.Request();
                            request.input('name', result.value.name);
                            request.input('email', result.value.email);
                            request.input('subject', result.value.subject);
                            request.input('message', result.value.message);
                            request.input('user', result.value.user);
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
                            type: 'validation-error',
                            reason: 'Invalid User'
                        });
                    }
        })
    }
}