"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("mssql");
const Enterprise_1 = require("./Enterprise");
const Contact_1 = require("./Contact");
const Authentication_1 = require("./Authentication");
const dbconnection = sql['connect']({
    server: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'swivel',
    options: {
        encrypt: true
    }
}, function (error) {
    if (error) {
        console.log('Connection Error', error); //val.replace(/\s{2,}/g, ' ')
    }
    else {
        var usr = new Authentication_1.Authentication();
        var msg = new Contact_1.Contact();
        var ent = new Enterprise_1.Enterprise();
        // console.log(ent.getCountyID('Nairobi'))
        // console.log(ent.corporate("Eclectic Int", "Abd    ul", "https://ekenya.co.ke", "hr@ekenya.co.ke", "070163301   6", "Nairobi"));
        // console.log(ent.corporate("Eclectic", "Abdulaziz", "https://ekeny.co.ke", "hr@ekenya.co.ke", "0765223124", "Nairobi"));
        // console.log(usr.register("1234    yhu","@#$%%","^        ","hallo","abdul@ekenya.co.ke", "tanga","yes123", "g", "Kenyan","31672609","Zizahry@123", "Zizahry@123"));
        // console.log(usr.register("Patrick","James","Kimani","07016330  17","patrick@ekenya.co.ke", "Kenya","03-11-1991", "M", "Kenyan","31672610","Zizahry@123", "Zizahry@123"));
        console.log(usr.register("Abdulaziz", "Mohd", "Rajab", "0701633046", "abdulo@ekenya.co.ke", "Kenya", "13-06-1993", "M", "Kenyan", "31672612", "Zizahry@123", "Zizahry@123"));
        // console.log(usr.login("abdul@ekenya.co.ke", "Zizahry@123"))
        // console.log(msg.contactForm("Abdul Aziz", "abdul@ekenya.co.ke", "My subject", "Here's my Message", "0701633018"))
    }
});
exports.DBmessageHdler = dbconnection;
// export { pool1 as ConnectionPool }
