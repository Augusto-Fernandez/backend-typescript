import { Request, Response, NextFunction } from "express";

const adminOnly = () =>{
    return async(req:Request, res:Response, next:NextFunction) =>{
        const {_doc} = req.user;

        if(!_doc.isAdmin){
            return res.status(401).send({message: 'Not authorized'});
        }

        next();
    };
};

export default adminOnly;