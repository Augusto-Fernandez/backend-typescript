import MongooseAdapter from "./mongooseAdapter";

class DbFactory {
    static create(dbType = 'MongooseAdapter') {
        const dbs = new Map();
        dbs.set('MongooseAdapter', MongooseAdapter);

        if (!dbs.has(dbType)) {
            throw Error('Not found DbAdapter');
        }

        const db = dbs.get(dbType);
        return new db();
    }
}

export default DbFactory;