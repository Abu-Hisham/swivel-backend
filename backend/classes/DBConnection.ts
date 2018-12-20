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
        // console.log(ent.corporate("Eclectic", "Abdulaziz", "https://ekeny.co.ke", "hr@ekenya.co.ke", "0765223124", "Nairobi"));
        console.log(usr.register("Salim","Mwayogwe","Bahresa","0701633256","abduli@ekenya.co.ke", "Tanzania","12-03-1993", "M", "Kenyan","31672619","Zizahry@123", "Zizahry@123"));
        // console.log(usr.register("Patrick","James","Kimani","07016330  17","patrick@ekenya.co.ke", "Kenya","03-11-1991", "M", "Kenyan","31672610","Zizahry@123", "Zizahry@123"));
        // console.log(usr.register("Abdulaziz","Mohd","Rajab","0701633016","abdul@ekenya.co.ke", "Kenya","13-06-1993", "M", "Kenyan","31672609","Zizahry@123", "Zizahry@123"));
        // console.log(usr.login("abdul@ekenya.co.ke", "Zizahry@123"))
        // console.log(msg.contactForm("Abdul Aziz", "abdul@ekenya.co.ke", "My subject", "Here's my Message", "0701633018"))
    }
})
export { dbconnection as DBmessageHdler }
// export { pool1 as ConnectionPool }