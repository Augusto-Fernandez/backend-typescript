import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
    DB_URI: str(),
    NODE_PORT: port(),
    APPLICATION: str(),
    DB: str(),
    JWT_PRIVATE_KEY:str(),
    SMTP_EMAIL:str(),
    SMTP_KEY:str(),
    URL:str(),
    STRIPE_PRIVATE_KEY:str()
});