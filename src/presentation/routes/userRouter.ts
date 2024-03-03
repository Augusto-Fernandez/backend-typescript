import {Router} from "express";
import { deleteOne, getOne, list, save, updateOne, addRole, deleteRole, addCart, deleteCart } from "../controllers/userController";
import auth from "../middlewares/auth";
import permissions from "../middlewares/persmissions";
import adminOnly from "../middlewares/adminOnly";

const userRouter = Router();

userRouter.use(auth);

userRouter.get("/", adminOnly(), list);
userRouter.get("/:id", adminOnly(), getOne);
userRouter.post("/", adminOnly(), save);
userRouter.put("/:id", adminOnly(), updateOne);
userRouter.delete("/:id", adminOnly(), deleteOne);
userRouter.put("/:id/roles/:rid", adminOnly(), addRole);
userRouter.put('/:id/roles', adminOnly(), deleteRole);
userRouter.put('/:id/carts/:cid', permissions('addCartToUser'), addCart);
userRouter.put('/:id/carts', permissions('deleteUserCart'), deleteCart);

export default userRouter;