import {ActivityResponse} from "../models/ActivityResponse";

export interface IKentaPayEnterprise {

    corporate(companyName: string, contactPersonsName: string, companyUrl: string, emailAddress: string, phoneNumber: string, county: string):Promise<ActivityResponse>;

    merchant(companyName: string, contactPersonsName: string, companyUrl: string, emailAddress: string, phoneNumber: string, county: string):Promise<ActivityResponse>;

}