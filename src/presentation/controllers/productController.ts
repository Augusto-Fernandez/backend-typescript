import { RequestHandler } from "express";
import { ParsedQs } from "qs";

import ProductManager from "../../domain/managers/productManager";

import idValidation from "../../domain/validations/shared/idValidation";
import productCreateValidation from "../../domain/validations/product/productCreateValidation";

type SortOptions = {
    sort?:string,
    limit?: number,
    page?: number
}

export const list:RequestHandler = async (req, res, next) =>{
    try{
        const {sort, limit, page}:SortOptions = req.query as ParsedQs;
        const manager = new ProductManager();
        const products = await manager.getAll(sort, limit, page);
        res.status(200).json(products);
    }catch(e){
        next(e);
    }
};

export const getOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new ProductManager();
        const product = await manager.getOne(id);
        res.status(200).json(product);
    }catch(e){
        next(e);
    }
};

export const save:RequestHandler = async (req, res, next) =>{
    try{
        await productCreateValidation.parseAsync(req.body);
        const manager = new ProductManager();
        const product = await manager.create(req.body);
        res.status(201).json(product);
    }catch(e){
        next(e);
    }
};

export const updateOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        await productCreateValidation.parseAsync(req.body);
        const { id } = req.params;
        const manager = new ProductManager();
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
        const manager = new ProductManager();
        const product = await manager.deleteOne(id);
        res.status(200).json(product);
    }catch(e){
        next(e);
    }
};
