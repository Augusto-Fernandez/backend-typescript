import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import env from "../../config/validateEnv";

const auth: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Empty authentication header!' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, env.JWT_PRIVATE_KEY, (error, credentials) => {
        if (error) return res.status(403).send({ error: 'Authentication error' });
        if (credentials !== undefined && typeof credentials !== 'string') {
            req.user = credentials.user;
            next();
        }
    });
};

export default auth;
