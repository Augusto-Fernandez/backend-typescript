import mongoose from "mongoose";
import { exit } from 'shelljs';
import { program } from 'commander';
import dotenv from 'dotenv';
dotenv.config();

import env from "./config/validateEnv";
import CreateAdminCommand from './presentation/commands/createAdmin';

void (async () => {
    try {
        await mongoose.connect(env.DB_URI);

        program.addCommand(CreateAdminCommand);

        await program.parseAsync(process.argv);

        exit();
    }
    catch (error) {
        console.log(error);
        exit();
    }
})();