import env from "../../config/validateEnv";

import express, {Express} from "express";
import {Server} from "http";
import cookieParser from "cookie-parser";
import cors from 'cors';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from 'swagger-ui-express';

import productRouter from "../routes/productRouter";
import userRouter from "../routes/userRouter";
import cartRouter from "../routes/cartRouter";
import roleRouter from "../routes/roleRouter";
import sessionRouter from "../routes/sessionRouter";

import { addLogger } from "../../utils/logger";
import errorHandler from "../middlewares/errorHandler";
import swaggerOptions from "../../config/swaggerConfig";

class AppExpress{
    app: Express;
    server!: Server;
    
    constructor(){
        this.app = express();
    }

    init(){
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    build(){
        this.app.use(addLogger);

        this.app.use('/api/products', productRouter);
        this.app.use('/api/users', userRouter);
        this.app.use('/api/carts', cartRouter);
        this.app.use('/api/roles', roleRouter);
        this.app.use('/api/sessions', sessionRouter);

        this.app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerJSDoc(swaggerOptions)));

        this.app.use(errorHandler);
    }

    callback(){
        return this.app;
    }

    listen(){
        this.server = this.app.listen(env.NODE_PORT, () => {
            console.log(`Server listening on port ${env.NODE_PORT}`);
        });

        return this.server;
    }
}

export default AppExpress;