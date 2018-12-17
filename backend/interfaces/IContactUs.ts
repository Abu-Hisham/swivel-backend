import {ActivityResponse} from "../models/ActivityResponse";

export interface IContactUs {

    contactForm(name, email, subject, message, user): ActivityResponse;

}