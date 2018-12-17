import {ActivityResponse} from "../models/ActivityResponse";

export interface ILoyaltyPoints {

    save(amount: number, user: string): ActivityResponse;

    retrieve(): number | ActivityResponse;

    utilise(points: number): ActivityResponse;

}