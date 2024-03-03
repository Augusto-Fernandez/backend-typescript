import "dotenv/config";
import env from "../config/validateEnv";

import DbFactory from "../data/factories/dbFactory.js";
import AppFactory from "../presentation/factories/appFactory.js";

const initServer = async () => {
    const db = DbFactory.create(env.DB);

    const app = AppFactory.create();

    app.init();
    app.build();

    return {
        app,
        db
    };
};

export default initServer;