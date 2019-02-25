import * as express from 'express';
import { PreparedStatement } from 'mssql';

class User {
    router: express.Router;

    constructor() {
        this.router = express.Router();
        this.router.get('/api/users', this.getAllUsers);
        this.router.post('/api/users', this.save);
        this.router.get('/api/users/:id', this.getSingleUser);
        this.router.delete('/app/users/:id', this.delete)
    }
    private getAllUsers(request: express.Request, response: express.Response, next: express.NextFunction){
        (async function(){
            let recordSet;
            let results;
            let page = request.params.page
            let limit = request.params.limit
            try {
                let ps = new PreparedStatement();
                await ps.prepare(`SELECT * FROM [TBCUSTOMERS]`, err=>{
                    ps.stream = true;
                    const request = ps.execute({});
                    request.on('recordset', columns =>{
                    });
                    request.on('row', row=>{

                    });
                });
                results = recordSet.map.stream(element => {
                    return {
                        firstName: element['FIRSTNAME'],
                        lastName: element['LASTNAME'],
                        otherName: element['OTHERNAME'],
                        emailAddress: element['EMAILADDRESS'],
                        mobileNumber: element['MOBILENUMBER'],
                        idNumber: element['IDENTIFICATIONID'],
                        country: element['COUNTRY'],
                        nationality: element['NATIONALITY'],
                        dateOfBirth: element['DATEOFBIRTH'],
                        gender: element['GENDER']
                    };
                });
                response.statusCode == 200
                response.write(`<ul>
                                    <li>${results}<li>
                                </ul>`);
                response.send(results)
            } catch (error) {
                // response.json({
                //     STATUS: '400',
                //     MESSAGE: 'Bad Request',
                // });
                response.statusCode == 400
                response.end;
            }

        }); 
    }
    private getSingleUser(request: express.Request, response: express.Response, next: express.NextFunction){}
    private save(request: express.Request, response: express.Response, next: express.NextFunction){
    }
    private delete(request: express.Request, response: express.Response, next: express.NextFunction){}
}
export default (new User()).router;
