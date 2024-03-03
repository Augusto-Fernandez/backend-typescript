import RoleManager from "../../domain/managers/roleManager";
import { Request, Response, NextFunction } from "express";

const permissions = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { _doc } = req.user;

        let accessGranted = false;

        if(_doc.isAdmin){
            accessGranted = true;
        }

        if(!_doc.isAdmin && _doc.role.length>0){
            const roleManager = new RoleManager();

            for (const roleName of _doc.role) {
                const role = await roleManager.getOne(roleName);

                if(role.permissions.includes(permission)){
                    accessGranted = true;
                    break;
                }
            }
        }

        if (!accessGranted) {
            return res.status(401).send({ message: 'Not authorized' });
        }

        next();
    };
};

export default permissions;
