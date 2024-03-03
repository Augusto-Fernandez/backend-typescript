import "dotenv/config";
import env from "./config/validateEnv";

import DbFactory from "./data/factories/dbFactory";
import AppFactory from "./presentation/factories/appFactory";

const start = async () => {
    try {
        const db = DbFactory.create(env.DB);

        await db.init(env.DB_URI);

        const app = AppFactory.create(env.APPLICATION);

        app.init();
        app.build();
        app.listen();
    } catch (error) {
        console.error("Mongoose Connection Failed", error);
    }
};

start();
