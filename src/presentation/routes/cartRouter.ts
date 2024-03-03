import {Router} from "express";
import { deleteCart, getOne, list, save, updateOne, addToCart, deleteOne, deleteAll, checkout } from "../controllers/cartController";
import auth from "../middlewares/auth";
import permissions from "../middlewares/persmissions";
import adminOnly from "../middlewares/adminOnly";

const cartRouter = Router();

cartRouter.use(auth);

cartRouter.get("/", adminOnly(), list);
cartRouter.get("/:id", permissions("getOneCart"), getOne);
cartRouter.post("/", permissions("saveCart"), save);
cartRouter.put("/:id", permissions("updateCart"), updateOne);
cartRouter.delete("/:id/cart", adminOnly(), deleteCart);
cartRouter.put("/:id/products/:pid", permissions('addToCart'), addToCart);
cartRouter.delete("/:id/products/:pid", permissions('deleteOneItem'), deleteOne);
cartRouter.delete("/:id", permissions('deleteAllItems'), deleteAll);
cartRouter.get("/:id/checkout", permissions('checkout'), checkout);

export default cartRouter;
