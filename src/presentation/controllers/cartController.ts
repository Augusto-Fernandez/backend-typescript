import { RequestHandler } from "express";
import { ParsedQs } from "qs";

import CartManager from "../../domain/managers/cartManager";

import idValidation from "../../domain/validations/shared/idValidation";
import cartUpdateValidation from "../../domain/validations/cart/cartUpdateValidation";
import cartParamsValidation from "../../domain/validations/cart/cartParamsValidation";

type CartSortOptions = {
    limit?: number,
    page?: number
}

export const list:RequestHandler = async (req, res, next) =>{
    try{
        const {limit, page}:CartSortOptions = req.query as ParsedQs;
        const manager = new CartManager();
        const cart = await manager.getAll(limit, page);
        res.status(200).json(cart);
    }catch(e){
        next(e);
    }
};

export const getOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new CartManager();
        const cart = await manager.getOne(id);
        res.status(200).json(cart);
    }catch(e){
        next(e);
    }
};

export const save:RequestHandler = async (req, res, next) =>{
    try{
        const manager = new CartManager();
        const cart = await manager.create();
        res.status(201).json(cart);
    }catch(e){
        next(e);
    }
};

export const updateOne:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        await cartUpdateValidation.parseAsync(req.body);
        const { id } = req.params;
        const manager = new CartManager();
        const cart = await manager.updateOne(id, req.body);
        res.status(200).json(cart);
    }catch(e){
        next(e);
    }
};

export const deleteCart:RequestHandler = async (req, res, next) =>{
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new CartManager();
        const cart = await manager.deleteCart(id);
        res.status(200).json(cart);
    }catch(e){
        next(e);
    }
};

export const addToCart:RequestHandler = async (req, res, next) => {
    try {
        await cartParamsValidation.parseAsync(req.params);
        const { id } = req.params;
        const { pid } = req.params;
        const manager = new CartManager();
        const cart = await manager.addToCart(id, pid);
        res.status(201).json(cart);
    } catch (e) {
        next(e);
    }
};

export const deleteOne:RequestHandler = async (req, res, next) => {
    try {
        await cartParamsValidation.parseAsync(req.params);
        const { id } = req.params;
        const { pid } = req.params;
        const manager = new CartManager();
        const cart = await manager.deleteOne(id, pid);
        res.status(200).json(cart);
    } catch (e) {
        next(e);
    }
};

export const deleteAll:RequestHandler = async (req, res, next) => {
    try {
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const manager = new CartManager();
        const cart = await manager.deleteAll(id);
        res.status(200).json(cart);
    } catch (e) {
        next(e);
    }
};

export const checkout:RequestHandler = async (req, res, next) => {
    try{
        await idValidation.parseAsync(req.params);
        const { id } = req.params;
        const { _doc } = req.user;
        const manager = new CartManager();
        const cart = await manager.checkout(id, { userName: _doc.userName, email: _doc.email});
        res.status(200).send({ status: "sucess", cart, message: "Successful Purchase" });
    }catch(e){
        next(e);
    }
};
