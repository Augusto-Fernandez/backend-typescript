import {Router} from "express";
import {signup, login, logout, current, changePassword, forgotPassword, resetPassword} from "../controllers/sessionController";
import auth from "../middlewares/auth";

const sessionRouter = Router();

sessionRouter.post('/login', login);
sessionRouter.post('/signup', signup);
sessionRouter.post('/logout', logout);
sessionRouter.get('/current', auth, current);
sessionRouter.post('/change-password', auth, changePassword);
sessionRouter.post('/forgot-password', forgotPassword);
sessionRouter.post('/reset-password', resetPassword);

export default sessionRouter;
