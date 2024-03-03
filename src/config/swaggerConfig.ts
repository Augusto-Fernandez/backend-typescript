import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Proyecto-Backend Api Documentation',
            version: "1.0.0",
            description: "Api Documentation with Swagger"
        }
    },
    apis: ['./docs/**/*.yaml']
};

export default swaggerOptions;
