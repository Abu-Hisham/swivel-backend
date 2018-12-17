import { IKentaPayEnterprise } from "../interfaces/IKentaPayEnterprise";
import { ActivityResponse } from "../models/ActivityResponse";
import Joi = require('joi');
import sql = require('mssql');


export class Enterprise implements IKentaPayEnterprise {
    constructor() { }
    validateInput(companyName: string, contactPersonsName: String, companyUrl: String, emailAddress: String, phoneNumber: String, county: String) {
        const schema = Joi.object().keys({
            companyName: Joi.string().min(5).regex(/^[A-Z a-z]+$/).required().replace(/\s{2,}/g, ' '),
            contactPersonsName: Joi.string().min(3).regex(/^[A-Z a-z]+$/).max(100).required().replace(/\s{2,}/g, ' '),
            companyUrl: Joi.string().max(500).regex(/^(http|https):\/\/[^ "]+$/).required(),
            emailAddress: Joi.string().max(100).email({ minDomainAtoms: 2 }).required(),
            phoneNumber: Joi.string().min(10).regex(/^[0-9]/).max(15).required().replace(/\s{1,}/g, ''),
            county: Joi.string().required().min(3).regex(/^[A-Z a-z]+$/).replace(/\s{2,}/g, ' ')
        })
        const result = Joi.validate({ companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county }, schema)
        return result;
    }


    corporate(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county): ActivityResponse {
        let result = this.validateInput(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county)
        const isCoporate = 1
        if (result.error == null) {
            this.countyExists(county)
                .then((res) => {
                    if (res === true) {
                        let query: string = `INSERT into [TBENTERPRISE] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE]) 
                                	         VALUES(@companyName, @contactPersonsName, @companyUrl, @emailAddress, @phoneNumber,(SELECT RCID FROM TBCOUNTIES WHERE NAME=@county), @isCorporate);`
                        let request = new sql.Request();
                        request.input('companyName', result.value.companyName)
                        request.input('contactPersonsName', result.value.contactPersonsName)
                        request.input('companyUrl', result.value.companyUrl)
                        request.input('emailAddress', result.value.emailAddress)
                        request.input('phoneNumber', result.value.phoneNumber)
                        request.input('county', result.value.county)
                        request.input('isCorporate', sql.Bit, isCoporate)
                        request.query(query, (err, resultset) => {
                            if (resultset) {
                                console.log('Query Successful', resultset)
                            } else {
                                console.log('Error in query', err)
                                console.log(query)
                            }
                        })
                    } else {
                        console.log('County does not exist')
                    }
                })
            return {
                type: 'success'
            };
        }
        else {
            return {
                type: 'validation-error',
                reason: result.error
            }
        }
    }

    async countyExists(county: string) {
        let query = `SELECT * FROM TBCOUNTIES WHERE NAME=@county`
        let request = new sql.Request();
        var countyExists: boolean;
        request.input('county', county);
        let temp = await request.query(query);
        let result = temp.recordsets
        if (result.length === 0) {
            countyExists = false;
            return countyExists;
        } else {
            countyExists = true;
            return countyExists;
        }
    }

    merchant(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county): ActivityResponse {
        let result = this.validateInput(companyName, contactPersonsName, companyUrl, emailAddress, phoneNumber, county)
        const isCoporate = 0
        if (result.error == null) {
            this.countyExists(county)
                .then((res) => {
                    if (res === true) {
                        let query: string = `INSERT into [TBENTERPRISE] ([COMPANYNAME],[CONTACTPERSONSNAME],[COMPANYURL],[EMAILADDRESS],[MOBILENUMBER],[COUNTYID],[ISCORPORATE]) 
                                             VALUES(@companyName, @contactPersonsName, @companyUrl, @emailAddress, @phoneNumber, (SELECT RCID FROM TBCOUNTIES WHERE NAME=@county),@isCorporate);`
                        let request = new sql.Request();
                        request.input('companyName', result.value.companyName)
                        request.input('contactPersonsName', result.value.contactPersonsName)
                        request.input('companyUrl', result.value.companyUrl)
                        request.input('emailAddress', result.value.emailAddress)
                        request.input('phoneNumber', result.value.phoneNumber)
                        request.input('county', result.value.county)
                        request.input('isCorporate', sql.Bit, isCoporate)
                        request.query(query, (err, resultset) => {
                            if (resultset) {
                                console.log('Query Successful', resultset)
                            } else {
                                console.log('Error in query', err)
                                console.log(query)
                            }
                        })
                    } else {
                        console.log('County does not exist')
                    }
                })
            return {
                type: 'success'
            };
        }
        else {
            return {
                type: 'validation-error',
                reason: result.error
            }
        }

    }
}
