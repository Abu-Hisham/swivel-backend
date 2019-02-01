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
        ent.corporate("Eclectic Int", "Abd    ul", "https://ekennya.co.ke", "hr@ekenya.co.ke", "070163301   6", "Nairobi").then((res) => { console.log(res); }).catch((err) => { console.log(err); });
        // ent.corporate("Eclectic", "Abdulaziz", "https://ekeny.co.ke", "hr@ekenya.co.ke", "0765223124", "Nairobi").then((res)=>{console.log(res)}).catch((err)=>{console.log(err)});
        // usr.register("Salim","Mwayogwe","Bahresa","0701633236","abdula@ekenya.co.ke", "Tanzania","12-03-1993", "M", "Kenyan","31672615","Zizahry@123", "Zizahry@123").then((res)=>{console.log(res)}).catch((err)=>{console.log(err)});
        // usr.register("Patrick","James","Kimani","0701633367","patrick@ekenya.co.ke", "Kenya","03-11-1991", "M", "Kenyan","31672624","Zizahry@123", "Zizahry@123").
        // then((res)=>{console.log(res)}).
        // catch((err)=>{console.log(err)}));
        // usr.register("Abdulaziz","Mohd","Ra   jab","070163    3016","abdull@ekenya.co.ke", "Ke     nya","13-06-1993", "M", "Kenyan","336    72609","Zizahry@123", "Zizahry@123").then((res)=>{console.log(res)}).catch((err)=>{console.log(err)});
        // usr.login("abdull@ekenya.co.ke", "Zizahry@123").then((res)=>{console.log(res)}).catch((err)=>{console.log(err)})
        // msg.contactForm("Abdul Aziz", "abdo@ekenya.co.ke", "My subject", "Here's my Message", "0710633018").then((res)=>{console.log(res)}).catch((err)=>{console.log(err)})
    }
});
exports.DBmessageHdler = dbconnection;
// export { pool1 as ConnectionPool }
