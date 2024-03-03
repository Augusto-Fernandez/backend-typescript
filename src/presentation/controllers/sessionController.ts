import { RequestHandler } from "express";

import SessionManager from "../../domain/managers/sessionManager";

import userCreateValidation from "../../domain/validations/user/userCreateValidation";
import loginValidation from "../../domain/validations/session/loginValidation";
import passwordValidation from "../../domain/validations/session/passwordValidation";
import emailValidation from "../../domain/validations/session/emailValidation";

export const signup:RequestHandler = async (req, res, next) =>{
    try{
        await userCreateValidation.parseAsync(req.body);
        const data = req.body;
        const manager = new SessionManager();
        const signup = await manager.signup(data);
        res.status(201).json(signup);
    }catch(e){
        next(e);
    }
};

export const login:RequestHandler = async (req, res, next) =>{
    try{
        await loginValidation.parseAsync(req.body);
        const { email, password } = req.body;
        const manager = new SessionManager();
        const sessionLogin = await manager.login({ email, password });
        res.cookie('accessToken', sessionLogin, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true
        }).json({ message: 'Login success!', sessionLogin });
    }catch(e){
        next(e);
    }
};

export const logout:RequestHandler = async (req, res, next) =>{
    try{
        res.clearCookie('accessToken');
        const { _doc } = req.user;
        const manager = new SessionManager();
        await manager.logout(_doc.id);
        res.json({ message: 'Logout successful' });
    }catch(e){
        next(e);
    }
};

export const current:RequestHandler = async (req, res) => {
    res.status(200).send({ status: 'Success', payload: req.user });
};

export const changePassword:RequestHandler = async (req, res, next) => {
    try{
        await passwordValidation.parseAsync(req.body);
        const { _doc } = req.user;
        const { password } = req.body;
        const manager = new SessionManager();
        const changePassword = await manager.changePassword({ email: _doc.email, password });
        res.status(200).json({ status: 'success', changePassword, message: 'User changed password.' });
    }catch (e){
        next(e);
    }
};

export const forgotPassword:RequestHandler = async (req, res, next) => {
    try{
        await emailValidation.parseAsync(req.body);
        const { email } = req.body;
        const manager = new SessionManager();
        const forgetPassword = await manager.forgotPassword(email);
        res.status(200).send({ status: 'success', forgetPassword, message: 'Mail sended' });
    }catch (e){
        next(e);
    }
};

export const resetPassword:RequestHandler = async (req, res, next) => {
    try{
        await passwordValidation.parseAsync(req.body);
        const token = req.query.token as string;
        const { password } = req.body;
        const manager = new SessionManager();
        const resetPassword = await manager.resetPassword({ token , password });
        res.status(200).send({ status: 'success', resetPassword, message: 'User change password.' });
    }catch (e){
        next(e);
    }
};
