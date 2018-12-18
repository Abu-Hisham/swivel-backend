import {ActivityResponse} from "../models/ActivityResponse";

export interface IAuthentication {

    login(user: string, password: string);

    register(firstName: string, lastName:string, otherName:string, mobileNumber:string, emailAddress:string, country:string, dateOfBirth:string, gender:string, nationality:string, nationalID:string, password:string, passwordConfirm:string);

    forgotPassword(user: string): ActivityResponse;

    newPassword(token: string, password: string, passwordConfirm: string): ActivityResponse;
}