import "dotenv/config";
import env from "./config/validateEnv";

import { createContainer, asClass, Lifetime } from "awilix";

import ProductMongooseRepository from "./data/repositories/productMongooseRepository";
import UserMongooseRepository from "./data/repositories/userMongooseRepository";
import CartMongooseRepository from "./data/repositories/cartMongooseRepository";
import RoleMongooseRepository from "./data/repositories/roleMongooseRepository";
import TicketMongooseRepository from "./data/repositories/ticketMongooseRepository";

const container = createContainer();

if(env.DB === "MongooseAdapter"){
    container.register('ProductRepository', asClass(ProductMongooseRepository, {lifetime: Lifetime.SINGLETON}));
    container.register('UserRepository', asClass(UserMongooseRepository, {lifetime: Lifetime.SINGLETON}));
    container.register('CartRepository', asClass(CartMongooseRepository, {lifetime: Lifetime.SINGLETON}));
    container.register('RoleRepository', asClass(RoleMongooseRepository, {lifetime: Lifetime.SINGLETON}));
    container.register('TicketRepository', asClass(TicketMongooseRepository, {lifetime: Lifetime.SINGLETON}));
}

export default container;