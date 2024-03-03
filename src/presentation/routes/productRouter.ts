import {Router} from "express";
import { deleteOne, getOne, list, save, updateOne } from "../controllers/productController";
import auth from "../middlewares/auth";
import permissions from "../middlewares/persmissions";
import adminOnly from "../middlewares/adminOnly";

const productRouter = Router();

productRouter.use(auth);

productRouter.get("/", permissions('getAllProducts'), list);
productRouter.get("/:id", permissions('getOneProduct'), getOne);
productRouter.post("/", adminOnly(), save);
productRouter.put("/:id", adminOnly(), updateOne);
productRouter.delete("/:id", adminOnly(), deleteOne);

export default productRouter;
