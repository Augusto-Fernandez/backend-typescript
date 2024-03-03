import { RequestHandler } from "express";
import { ParsedQs } from "qs";

import RoleManager from "../../domain/managers/roleManager";

import idValidation from "../../domain/validations/shared/idValidation";
import roleCreateValidation from "../../domain/validations/role/roleCreateValidation";

type RoleSortOptions = {
    limit?: number,
    page?: number
}

export const list:RequestHandler = async (req, res, next) =>{
    try{
        const {limit, page}:RoleSortOptions = req.query as ParsedQs;
        const manager = new RoleManager();
        const products = await manager.getAll(limit, page);
        res.status(200).json(products);
    }catch(e){
        next(e);
    }
};

export const getOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new RoleManager();
        const product = await manager.getOne(id);
        res.status(200).json(product);
    }catch(e){
        next(e);
    }
};

export const save:RequestHandler = async (req, res, next) =>{
    try{
        await roleCreateValidation.parseAsync(req.body);
        const manager = new RoleManager();
        const product = await manager.create(req.body);
        res.status(201).json(product);
    }catch(e){
        next(e);
    }
};

export const updateOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        await roleCreateValidation.parseAsync(req.body);
        const { id } = req.params;
        const manager = new RoleManager();
        const product = await manager.updateOne(id, req.body);
        res.status(200).json(product);
    }catch(e){
        next(e);
    }
};

export const deleteOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new RoleManager();
        const product = await manager.deleteOne(id);
        res.status(200).json(product);
    }catch(e){
        next(e);
    }
};
