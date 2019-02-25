import {ActivityResponse} from "../models/ActivityResponse";

/**
 *
 * /
 */
export interface IKentaPayEnterprise {

    /**
     * corporateRequest
     *
     * @param {string} companyName
     * @param {string} contactPersonsName
     * @param {string} companyUrl
     * @param {string} emailAddress
     * @param {string} phoneNumber
     * @param {string} county
     *
     * @returns Promise<ActivityResponse>
     */
    corporateRequest(companyName: string, contactPersonsName: string, companyUrl: string, emailAddress: string, phoneNumber: string, county: string, user?: string): Promise<ActivityResponse>;

    /**
     * corporate
     *
     * @param {string} name
     * @param {string} company
     * @param {string} companyUrl
     * @param {string} emailAddress
     * @param {string} phoneNumber
     * @param {string} county
     * @param {string} monthlyVolumes
     * @param {string} averageTransactions
     *
     * @returns Promise<ActivityResponse>
     */
    corporate(name: string, company: string, companyUrl: string, emailAddress: string, phoneNumber: string, county: string, monthlyVolumes: string, averageTransactions: string, user?: string): Promise<ActivityResponse>;

    /**
     * merchantRequest
     *
     * @param {string} companyName
     * @param {string} contactPersonsName
     * @param {string} companyUrl
     * @param {string} emailAddress
     * @param {string} phoneNumber
     * @param {string} county
     *
     * @returns Promise<ActivityResponse>
     */
    merchantRequest(companyName: string, contactPersonsName: string, companyUrl: string, emailAddress: string, phoneNumber: string, county: string, user?: string): Promise<ActivityResponse>;

    /**
     * merchant
     *
     * @param {string} name
     * @param {string} company
     * @param {string} companyUrl
     * @param {string} emailAddress
     * @param {string} phoneNumber
     * @param {string} county
     * @param {string} monthlyVolumes
     * @param {string} averageTransactions
     *
     * @returns Promise<ActivityResponse>
     */
    merchant(name: string, company: string, companyUrl: string, emailAddress: string, phoneNumber: string, county: string, monthlyVolumes: string, averageTransactions: string,user?: string): Promise<ActivityResponse>;


}
