import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import initServer from "../app";
import UserMongooseRepository from "../../data/repositories/userMongooseRepository";
import SessionManager from "../../domain/managers/sessionManager";

describe("Testing User Endpoints Success", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    let jwt: string;

    type userId = {
        readonly _id: string,
        role: string[],
        cart: string[]
    }

    let user:userId;
    let roleId: string;
    let cartId:string;

    beforeAll(async function () {
        await db.init(uri);

        const payload = {
            userName: "admin",
            email: "admin@admin.com",
            password: "12345678"
        };

        const sessionManager = new SessionManager();
        await sessionManager.signup(payload);

        const userRepository = new UserMongooseRepository();
        const registedUser = await userRepository.getOneByEmail(payload.email);
        await userRepository.updateOne(registedUser?.id, {
            userName: registedUser?.userName,
            email: registedUser?.email,
            password: registedUser?.password,
            isAdmin: true
        });

        const login = await requester.post('/api/sessions/login').send({ email: payload.email, password: payload.password });
        jwt = login.body.sessionLogin;
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('Creacion de user /api/users/', async function () {
        const payload = {
            userName: "userr",
            email: "user@user.com",
            password: "12345678"
        };

        const result = await requester.post('/api/users/').set('Authorization', `Bearer ${jwt}`).send(payload);

        const { body, status } = result;

        user = body._doc;

        expect(status).toEqual(201);
        expect(body._doc.userName).toEqual(payload.userName);
        expect(body._doc.email).toEqual(payload.email);
        expect(body._doc.password).toBeDefined();
    });
    it('El repositorio debe devolver un arreglo', async function () {
        const result = await requester.get('/api/users/').set('Authorization', `Bearer ${jwt}`);

        const { status } = result;
        expect(status).toEqual(200);
    });
    it('El repositorio debe poder encontrar un user /api/users/:id', async function () {
        const result = await requester.get(`/api/users/${user._id}`).set('Authorization', `Bearer ${jwt}`);

        const { status } = result;
        expect(status).toEqual(200);
    });
    it('El repositorio debe poder actualizar un user /api/users/:id', async function () {
        const update = {
            userName: "userr2",
            email: "user2@user.com",
            password: "123456789"
        };

        const result = await requester.put(`/api/users/${user._id}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { body, status } = result;

        expect(status).toEqual(200);
        expect(body.userName).toEqual(update.userName);
        expect(body.email).toEqual(update.email);
        expect(body.password).toBeDefined();
    });
    it('El repositorio debe poder agregar un role a user /api/users/:id/roles/:rid', async function () {
        const payload = {
            name: "Prueba",
            permissions:[
                "Rol de Prueba"
            ]
        };
        
        const createRole = await requester.post('/api/roles/').set('Authorization', `Bearer ${jwt}`).send(payload);
        roleId = createRole.body._id;

        const result = await requester.put(`/api/users/${user._id}/roles/${roleId}`).set('Authorization', `Bearer ${jwt}`);

        const { body, status } = result;
        user.role = body.role;

        const isRoleAssigned = body.role.includes(roleId);

        expect(status).toEqual(200);
        expect(body).not.toBeNull();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); 
        expect(body).toHaveProperty('_id');
        expect(body._id).toBeTruthy();
        expect(user.role.length).toBeGreaterThan(0);
        expect(isRoleAssigned).toBeTruthy();
    });
    it('El repositorio debe poder borrar el role de user /api/users/:id/roles', async function () {
        const result = await requester.put(`/api/users/${user._id}/roles`).set('Authorization', `Bearer ${jwt}`);

        const { body, status } = result;

        user.role = body.role;

        expect(status).toEqual(200);
        expect(body).not.toBeNull();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); 
        expect(body).toHaveProperty('_id');
        expect(body._id).toBeTruthy();
        expect(user.role.length).toBe(0);
    });
    it('El repositorio debe poder agregar un cart a user /api/users/:id/carts/:cid', async function () {
        const createCart = await requester.post('/api/carts/').set('Authorization', `Bearer ${jwt}`);
        cartId = createCart.body._id;

        const result = await requester.put(`/api/users/${user._id}/carts/${cartId}`).set('Authorization', `Bearer ${jwt}`);

        const { body, status } = result;
        user.cart = body.cart;

        const isCartAssigned = body.cart.includes(cartId);

        expect(status).toEqual(200);
        expect(body).not.toBeNull();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); 
        expect(body).toHaveProperty('_id');
        expect(body._id).toBeTruthy();
        expect(user.cart.length).toBeGreaterThan(0);
        expect(isCartAssigned).toBeTruthy();
    });
    it('El repositorio debe poder borrar el cart de user /api/users/:id/carts', async function () {
        const result = await requester.put(`/api/users/${user._id}/carts`).set('Authorization', `Bearer ${jwt}`);

        const { body, status } = result;
        user.cart = body.cart;

        expect(status).toEqual(200);
        expect(body).not.toBeNull();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); 
        expect(body).toHaveProperty('_id');
        expect(body._id).toBeTruthy();
        expect(user.cart.length).toBe(0);
    });
    it('El repositorio debe poder eliminar un user /api/users/:id', async function (){
        const result = await requester.delete(`/api/users/${user._id}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status } = result;
        expect(status).toEqual(200);
    });
});

describe("Testing User Endpoints Fail", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    let jwt: string;

    type userId = {
        readonly _id: string,
        role: string[];
        cart: string[]
    }

    let user:userId;
    let roleId: string;
    let cartId: string;

    beforeAll(async function () {
        await db.init(uri);

        const payload = {
            userName: "admin",
            email: "admin@admin.com",
            password: "12345678"
        };

        const sessionManager = new SessionManager();
        await sessionManager.signup(payload);

        const userRepository = new UserMongooseRepository();
        const registedUser = await userRepository.getOneByEmail(payload.email);
        await userRepository.updateOne(registedUser?.id, {
            userName: registedUser?.userName,
            email: registedUser?.email,
            password: registedUser?.password,
            isAdmin: true
        });

        const login = await requester.post('/api/sessions/login').send({ email: payload.email, password: payload.password });
        jwt = login.body.sessionLogin;

        const userPayload = {
            userName: "userr",
            email: "user@user.com",
            password: "12345678"
        };

        const createUser = await requester.post('/api/users/').set('Authorization', `Bearer ${jwt}`).send(userPayload);

        user = createUser.body._doc;

        const rolePayload = {
            name: "Prueba",
            permissions:[
                "Rol de Prueba"
            ]
        };

        const createRole = await requester.post('/api/roles/').set('Authorization', `Bearer ${jwt}`).send(rolePayload);

        roleId = createRole.body._id;

        const createCart = await requester.post('/api/carts/').set('Authorization', `Bearer ${jwt}`);

        cartId = createCart.body._id;
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('ZodError: Fallo donde el repositorio debe poder crear un user /api/users', async function (){
        const payload = {
            email: "user2@user.com",
            password: "12345678"
        };

        const result = await requester.post('/api/users').set('Authorization', `Bearer ${jwt}`).send(payload);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('Fallo donde el repositorio debe poder encontrar un user /api/users/:id', async function (){
        const result = await requester.get(`/api/users/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder encontrar un user /api/users/:id', async function (){
        const result = await requester.get(`/api/users/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder encontrar un user /api/users/:id', async function (){
        const result = await requester.get(`/api/users/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe poder actualizar un user /api/users/:id', async function () {
        const update = {
            userName: "userr2",
            email: "user2@user.com",
            password: "123456789"
        };

        const result = await requester.put(`/api/users/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder actualizar un user /api/users/:id', async function () {
        const update = {
            userName: "userr2",
            email: "user2@user.com",
            password: "123456789"
        };

        const result = await requester.put(`/api/users/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder actualizar un user /api/users/:id', async function () {
        const update = {
            userName: "userr2",
            email: "user2@user.com",
            password: "123456789"
        };

        const result = await requester.put(`/api/users/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe poder actualizar un user /api/users/:id', async function () {
        const update = {
            email: "user2@user.com",
            password: "123456789"
        };

        const result = await requester.put(`/api/users/${user._id}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('Fallo donde el repositorio debe poder eliminar un user /api/users/:id', async function () {
        const result = await requester.delete(`/api/users/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder eliminar un user /api/users/:id', async function () {
        const result = await requester.delete(`/api/users/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder eliminar un user /api/users/:id', async function () {
        const result = await requester.delete(`/api/users/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe poder agregar un role a user /api/users/:id/roles/:rid', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(24)}/roles/${roleId}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found User");
    });
    it('Fallo donde el repositorio debe poder agregar un role a user /api/users/:id/roles/:rid', async function () {
        const result = await requester.put(`/api/users/${user._id}/roles/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual('Not Found Role');
    });
    it('ZodError: Fallo donde el repositorio debe poder agregar un role a user /api/users/:id/roles/:rid', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(23)}/roles/${roleId}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder agregar un role a user /api/users/:id/roles/:rid', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(25)}/roles/${roleId}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('ZodError: Fallo donde el repositorio debe poder agregar un role a user /api/users/:id/roles/:rid', async function () {
        const result = await requester.put(`/api/users/${user._id}/roles/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder agregar un role a user /api/users/:id/roles/:rid', async function () {
        const result = await requester.put(`/api/users/${user._id}/roles/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe poder borrar todos los roles de user /api/users/:id/roles', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(24)}/roles`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found User");
    });
    it('ZodError: Fallo donde el repositorio debe poder borrar todos los roles de user /api/users/:id/roles', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(23)}/roles`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder borrar todos los roles de user /api/users/:id/roles', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(25)}/roles`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe poder borrar todos los roles de user /api/users/:id/roles', async function () {
        const result = await requester.put(`/api/users/${user._id}/roles`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual('Not Found Roles');
    });
    it('Fallo donde el repositorio debe poder agregar cart a user /api/users/:id/carts/:cid', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(24)}/carts/${cartId}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found User");
    });
    it('ZodError: Fallo donde el repositorio debe poder agregar cart a user /api/users/:id/carts/:cid', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(23)}/carts/${cartId}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder agregar cart a user /api/users/:id/carts/:cid', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(25)}/carts/${cartId}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe poder agregar cart a user /api/users/:id/carts/:cid', async function () {
        const result = await requester.put(`/api/users/${user._id}/carts/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Cart");
    });
    it('ZodError: Fallo donde el repositorio debe poder agregar cart a user /api/users/:id/carts/:cid', async function () {
        const result = await requester.put(`/api/users/${user._id}/carts/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder agregar cart a user /api/users/:id/carts/:cid', async function () {
        const result = await requester.put(`/api/users/${user._id}/carts/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe poder agregar cart a user /api/users/:id/carts/:cid', async function () {
        await requester.put(`/api/users/${user._id}/carts/${cartId}`).set('Authorization', `Bearer ${jwt}`);

        const result = await requester.put(`/api/users/${user._id}/carts/${cartId}`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("User Has Cart Already");
    });
    it('Fallo donde el repositorio debe poder borrar el cart de user /api/users/:id/carts', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(24)}/carts`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found User");
    });
    it('ZodError: Fallo donde el repositorio debe poder borrar el cart de user /api/users/:id/carts', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(23)}/carts`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder borrar el cart de user /api/users/:id/carts', async function () {
        const result = await requester.put(`/api/users/${faker.string.numeric(25)}/carts`).set('Authorization', `Bearer ${jwt}`);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
});
