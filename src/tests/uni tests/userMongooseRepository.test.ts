import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';

import initServer from "../app";
import UserMongooseRepository from "../../data/repositories/userMongooseRepository";
import RoleMongooseRepository from "../../data/repositories/roleMongooseRepository";
import CartMongooseRepository from "../../data/repositories/cartMongooseRepository";

describe("Testing User Mongoose Repository", async () => {
    const { db } = await initServer();
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const userRepository = new UserMongooseRepository();
    const roleRepository = new RoleMongooseRepository();
    const cartRepository = new CartMongooseRepository();

    type roleId = {
        readonly _id: string
    }
    
    type cartId = {
        readonly _id: string
    }

    type userId = {
        readonly _id: string,
        email: string,
        role: roleId[],
        cart: cartId[]
    }

    let user: userId;
    let role: roleId;
    let cart: cartId;

    beforeAll(async function () {
        await db.init(uri);
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('El repositorio debe ser una instancia de UserMongooseRepository', function () {
        expect(userRepository instanceof UserMongooseRepository).toBeTruthy();
    }, 60000);
    it('El repositorio debe poder crear un user', async function () {
        const payload = {
            userName: faker.person.fullName(),
            email: faker.internet.email(),
            password: "12345678"
        };

        const userDocument = await userRepository.create(payload);
        user = userDocument.toObject();

        expect(userDocument.userName).toEqual(payload.userName);
        expect(userDocument.email).toEqual(payload.email);
    });
    it('El repositorio debe devolver la cantidad de documentos', async function () {
        return userRepository
            .docCount()
            .then(result =>{
                expect(result).toBeTypeOf("number");
            }
        );
    });
    it('El repositorio debe devolver un arreglo', async function () {
        return userRepository
            .getAll(1, 1)
            .then(result => {
                expect(Array.isArray(result.payload.docs)).toBe(true);
                expect(result.payload.limit).toBe(1);
        });
    });
    it('El repositorio debe poder encontrar un user', async function () {
        return userRepository
            .getOne(user._id)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object');
                expect(result).toHaveProperty('id');
        });
    });
    it('El repositorio debe poder encontrar un user por su email', async function () {
        return userRepository
            .getOneByEmail(user.email)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object');
                expect(result).toHaveProperty('id');
                expect(result?.email).toEqual(user.email);
        });
    });
    it('El repositorio debe poder actualizar un user', async function (){
         const update = {
            userName: faker.person.fullName(),
            email: faker.internet.email(),
            password: "12345678"
        };

        return userRepository
            .updateOne(user._id, update)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object'); 
                expect(result).toHaveProperty('id');
                expect(result?.userName).toEqual(update.userName);
                expect(result?.email).toEqual(update.email);
        });
    });
    it('El repositorio debe poder agregar un role a user', async function (){
        const payload = {
            name: faker.lorem.word(),
            permissions:[
                faker.lorem.word()
            ]
        };

        const roleDocument = await roleRepository.create(payload);
        role = roleDocument.toObject();

        const userDocument = await userRepository.addRole(user._id, role._id);
        user.role = userDocument?.role as unknown as roleId[];

        expect(userDocument).not.toBeNull();
        expect(userDocument).toBeDefined();
        expect(typeof userDocument).toBe('object'); 
        expect(userDocument).toHaveProperty('id');
        expect(userDocument?._id).toBeTruthy();
        expect(user.role.length).toBeGreaterThan(0);
        expect(user.role).toStrictEqual(userDocument?.role);
    });
    it('El repositorio debe poder borrar el role de user', async function (){
        const userDocument = await userRepository.deleteRole(user._id);
        user.role = userDocument?.role as unknown as roleId[];

        expect(userDocument).not.toBeNull();
        expect(userDocument).toBeDefined();
        expect(typeof userDocument).toBe('object'); 
        expect(userDocument).toHaveProperty('id');
        expect(userDocument?._id).toBeTruthy();
        expect(user.role.length).toBe(0);
    });
    it('El repositorio debe poder agregar un cart a user', async function (){
        const cartDocument = await cartRepository.create();
        cart = cartDocument.toObject();

        const userDocument = await userRepository.addCart(user._id, cart._id);
        user.cart = userDocument?.cart as unknown as cartId[];

        expect(userDocument).not.toBeNull();
        expect(userDocument).toBeDefined();
        expect(typeof userDocument).toBe('object'); 
        expect(userDocument).toHaveProperty('id');
        expect(userDocument?._id).toBeTruthy();
        expect(user.cart.length).toBeGreaterThan(0);
        expect(user.cart).toStrictEqual(userDocument?.cart);
    });
    it('El repositorio debe poder borrar el cart de user', async function (){
        const userDocument = await userRepository.deleteCart(user._id);
        user.cart = userDocument?.cart as unknown as cartId[];

        expect(userDocument).not.toBeNull();
        expect(userDocument).toBeDefined();
        expect(typeof userDocument).toBe('object'); 
        expect(userDocument).toHaveProperty('id');
        expect(userDocument?._id).toBeTruthy();
        expect(user.cart.length).toBe(0);
    });
    it('El repositorio debe poder eliminar un user', async function (){
        return userRepository
            .deleteOne(user._id)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
            });
    });
});
