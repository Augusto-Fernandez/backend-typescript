import {Router} from "express";
import { deleteOne, getOne, list, save, updateOne } from "../controllers/roleController";
import auth from "../middlewares/auth";
import permissions from "../middlewares/persmissions";
import adminOnly from "../middlewares/adminOnly";

const roleRouter = Router();

roleRouter.use(auth);

roleRouter.get("/", permissions('getAllRoles'), list);
roleRouter.get("/:id", permissions('getOneRole'), getOne);
roleRouter.post("/", adminOnly(), save);
roleRouter.put("/:id", adminOnly(), updateOne);
roleRouter.delete("/:id", adminOnly(), deleteOne);

export default roleRouter;
