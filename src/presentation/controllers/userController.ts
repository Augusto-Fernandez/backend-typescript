import { RequestHandler } from "express";
import { ParsedQs } from "qs";

import UserManager from "../../domain/managers/userManager";

import idValidation from "../../domain/validations/shared/idValidation";
import userCreateValidation from "../../domain/validations/user/userCreateValidation";
import userCartParamsValidation from "../../domain/validations/user/userCartParamsValidation";
import userRoleParamsValidation from "../../domain/validations/user/userRoleParamsValidation";

type UserSortOptions = {
    limit?: number,
    page?: number
}

export const list:RequestHandler = async (req, res, next) =>{
    try{
        const {limit, page}:UserSortOptions = req.query as ParsedQs;
        const manager = new UserManager();
        const users = await manager.getAll(limit, page);
        res.status(200).json(users);
    }catch(e){
        next(e);
    }
};

export const getOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new UserManager();
        const user = await manager.getOne(id);
        res.status(200).json(user);
    }catch(e){
        next(e);
    }
};

export const save:RequestHandler = async (req, res, next) =>{
    try{
        await userCreateValidation.parseAsync(req.body);
        const manager = new UserManager();
        const user = await manager.create(req.body);
        res.status(201).json(user);
    }catch(e){
        next(e);
    }
};

export const updateOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        await userCreateValidation.parseAsync(req.body);
        const { id } = req.params;
        const manager = new UserManager();
        const user = await manager.updateOne(id, req.body);
        res.status(200).json(user);
    }catch(e){
        next(e);
    }
};

export const deleteOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new UserManager();
        const user = await manager.deleteOne(id);
        res.status(200).json(user);
    }catch(e){
        next(e);
    }
};

export const addRole:RequestHandler = async (req, res, next) =>{
    try{
        await userRoleParamsValidation.parseAsync(req.params);
        const { id } = req.params;
        const { rid } = req.params;
        const manager = new UserManager();
        const user = await manager.addRole(id, rid);
        res.status(200).json(user);
    }catch(e){
        next(e);
    }
};

export const deleteRole:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new UserManager();
        const user = await manager.deleteRole(id);
        res.status(200).json(user);
    }catch(e){
        next(e);
    }
};

export const addCart:RequestHandler = async (req, res, next) =>{
    try{
        await userCartParamsValidation.parseAsync(req.params);
        const { id } = req.params;
        const { cid } = req.params;
        const manager = new UserManager();
        const user = await manager.addCart(id, cid);
        res.status(200).json(user);
    }catch(e){
        next(e);
    }
};

export const deleteCart:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new UserManager();
        const user = await manager.deleteCart(id);
        res.status(200).json(user);
    }catch(e){
        next(e);
    }
};
