import * as express from 'express';

class Admin {
    router: express.Router;

    constructor() {
        this.router = express.Router();
    }
}

export default (new Admin()).router;
