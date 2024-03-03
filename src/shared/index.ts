import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import env from "../config/validateEnv";

export const createHash = async (password:string) =>{
    return await bcrypt.hash(password, 10);
};

export const isValidPassword = async (password:string, passwordHash:string) =>{
    return await bcrypt.compare(password, passwordHash);
};

export const generateToken = async (user:object) =>{
    return jwt.sign({user: {...user, password: undefined }}, env.JWT_PRIVATE_KEY, {expiresIn: '1h'});
};