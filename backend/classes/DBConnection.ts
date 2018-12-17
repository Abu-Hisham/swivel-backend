import sql = require('mssql');
import { Enterprise } from './Enterprise';
import { Contact } from './Contact';
import { Authentication } from './Authentication';
import passHash = require('password-hash')

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
    } else {
        var usr = new Authentication()
        var msg = new Contact()
        var ent = new Enterprise()
        // console.log(ent.getCountyID('Nairobi'))
        // console.log(ent.corporate("Eclectic Int", "Abd    ul", "https://ekenya.co.ke", "hr@ekenya.co.ke", "070163301   6", "Nairobi"));
        // console.log(ent.corporate("Eclectics", "Abdulaziz", "https://ekenya.co.ke", "hr@ekenya.co.ke", "0765223124", "Nakuru"));
        // console.log(usr.register("1234    yhu","@#$%%","^        ","hallo","abdul@ekenya.co.ke", "tanga","yes123", "g", "Kenyan","31672609","Zizahry@123", "Zizahry@123"));
        // console.log(usr.register("Patrick","James","Kimani","07016330  17","patrick@ekenya.co.ke", "Kenya","03-11-1991", "M", "Kenyan","31672610","Zizahry@123", "Zizahry@123"));
        console.log(usr.register("Peter","Mawira","Kipkirui","0701633018","peter@ekenya.co.ke", "Kenya","13-06-1993", "M", "Kenyan","31672610","Zizahry@123", "Zizahry@123"));
        // console.log(usr.login("0701633010", "Zizahry@123"))
        // console.log(msg.contactForm("Abdul Aziz", "abdul@ekenya.co.ke", "My subject", "Here's my Message", "0701633018"))
    }

})
export { dbconnection as DBmessageHandler }
// export { pool1 as ConnectionPool }