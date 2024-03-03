import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import initServer from "../app";
import UserMongooseRepository from "../../data/repositories/userMongooseRepository";
import SessionManager from "../../domain/managers/sessionManager";

describe("Testing Cart Endpoints Success", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    let jwt: string;

    type cartItem = {
        id: string;
        quantity: number;
    }

    type cartId = {
        readonly _id: string,
        items: cartItem[]
    }

    let cart:cartId;
    let productId: string;

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
    it('Creacion de cart /api/carts/', async function () {
        const result = await requester.post('/api/carts/').set('Authorization', `Bearer ${jwt}`);

        const { body, status } = result;

        cart = body;

        expect(status).toEqual(201);
        expect(body).toHaveProperty('_id');
        expect(body).toHaveProperty('items');
    });
    it('El repositorio debe devolver un arreglo', async function () {
        const result = await requester.get('/api/carts/').set('Authorization', `Bearer ${jwt}`);

        const { status } = result;
        expect(status).toEqual(200);
    });
    it('El repositorio debe poder encontrar un cart /api/carts/:id', async function () {
        const result = await requester.get(`/api/carts/${cart._id}`).set('Authorization', `Bearer ${jwt}`);

        const { status } = result;
        expect(status).toEqual(200);
    });
    it('El repositorio debe poder actualizar un cart /api/carts/:id', async function () {
        const payload = {
            title: "Test Product",
            description: "Test Description",
            price: 1,
            thumbnail: "Test Thumbnail",
            code: "1111111111111",
            stock: 1,
            status: true,
        };

        const createProduct = await requester.post('/api/products/').set('Authorization', `Bearer ${jwt}`).send(payload);
        productId = createProduct.body._id;

        const update = [
            {
                id: productId,
                quantity: 1
            }
        ];

        const result = await requester.put(`/api/carts/${cart._id}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { body, status } = result;

        expect(status).toEqual(200);
        expect(body).not.toBeNull();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); 
        expect(body).toHaveProperty('_id');
        expect(body._id).toBeTruthy();
        expect(JSON.stringify(body.items)).toStrictEqual(JSON.stringify(update));
    });
    it('El repositorio debe poder agregar un product un cart /api/carts/:id', async function () {
        const payload = {
            title: "Test Product",
            description: "Test Description",
            price: 2,
            thumbnail: "Test Thumbnail",
            code: "222222222222",
            stock: 2,
            status: true,
        };

        const createProduct = await requester.post('/api/products/').set('Authorization', `Bearer ${jwt}`).send(payload);
        productId = createProduct.body._id;

        const result = await requester.put(`/api/carts/${cart._id}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);

        const { body, status } = result;

        cart.items = body.items;

        const isProductInCart = body.items.some((item: { id: string; }) => JSON.stringify(item.id) === JSON.stringify(productId));

        expect(status).toEqual(201);
        expect(body).not.toBeNull();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); 
        expect(body).toHaveProperty('_id');
        expect(body._id).toBeTruthy();
        expect(cart.items.length).toBeGreaterThan(0);
        expect(isProductInCart).toBeTruthy();
    });
    it('El repositorio debe poder eliminar un product en cart /api/carts/:id', async function () {
        
        const result = await requester.delete(`/api/carts/${cart._id}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);

        const { body, status } = result;

        cart.items = body.items;

        const notInCart = cart.items.every(item => item.id !== productId);

        expect(status).toEqual(200);
        expect(body).not.toBeNull();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); 
        expect(body).toHaveProperty('_id');
        expect(body._id).toBeTruthy();
        expect(notInCart).toBeTruthy();
    });
    it('El repositorio debe poder eliminar todos los products en cart /api/carts/:id', async function () {
        const result = await requester.delete(`/api/carts/${cart._id}`).set('Authorization', `Bearer ${jwt}`);

        const { body, status } = result;

        cart.items = body.items;

        expect(status).toEqual(200);
        expect(body).not.toBeNull();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object'); 
        expect(body).toHaveProperty('_id');
        expect(body._id).toBeTruthy();
        expect(cart.items.length).toBe(0);
    });
    it('El repositorio debe poder eliminar un cart /api/carts/:id', async function (){
        const result = await requester.delete(`/api/carts/${cart._id}/cart`).set('Authorization', `Bearer ${jwt}`);
    
        const { status } = result;
        expect(status).toEqual(200);
    });
});

describe("Testing Cart Endpoints Fail", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    let jwt: string;

    type cartItem = {
        id: string;
        quantity: number;
    }

    type cartId = {
        readonly _id: string,
        items: cartItem[]
    }

    let cart:cartId;
    let productId: string;

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

        const createCart = await requester.post('/api/carts/').set('Authorization', `Bearer ${jwt}`);

        cart = createCart.body;

        const productPayload = {
            title: "Test Product",
            description: "Test Description",
            price: 1,
            thumbnail: "Test Thumbnail",
            code: "1111111111111",
            stock: 1,
            status: true,
        };

        const createProduct = await requester.post('/api/products/').set('Authorization', `Bearer ${jwt}`).send(productPayload);

        productId = createProduct.body._id;
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('Fallo donde el repositorio debe poder encontrar un cart /api/carts/:id', async function (){
        const result = await requester.get(`/api/carts/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder encontrar un cart /api/carts/:id', async function (){
        const result = await requester.get(`/api/carts/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('ZodError: Fallo donde el repositorio debe poder encontrar un cart /api/carts/:id', async function (){
        const result = await requester.get(`/api/carts/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('Fallo donde el repositorio debe poder actualizar un cart /api/carts/:id', async function () {
        const update = [
            {
                id: productId,
                quantity: 1
            }
        ];

        const result = await requester.put(`/api/carts/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder actualizar un cart /api/carts/:id', async function () {
        const update = [
            {
                id: productId,
                quantity: 1
            }
        ];

        const result = await requester.put(`/api/carts/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder actualizar un cart /api/carts/:id', async function () {
        const update = [
            {
                id: productId,
                quantity: 1
            }
        ];

        const result = await requester.put(`/api/carts/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('ZodError: Fallo donde el repositorio debe poder actualizar un cart /api/carts/:id', async function () {
        const update = [
            {
                id: productId
            }
        ];

        const result = await requester.put(`/api/carts/${cart._id}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('Fallo donde el repositorio debe poder actualizar un cart /api/carts/:id', async function () {
        const update = [
            {
                id: faker.string.numeric(24),
                quantity: 1
            }
        ];

        const result = await requester.put(`/api/carts/${cart._id}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual('Not Found Product Id');
    });
    it('Fallo donde el repositorio debe poder actualizar un cart /api/carts/:id', async function () { 
        const update = [
            {
                id: productId,
                quantity: 1
            },
            {
                id: productId,
                quantity: 1
            }
        ];

        const result = await requester.put(`/api/carts/${cart._id}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual('Product Already Added');
    });
    it('Fallo donde el repositorio debe poder eliminar cart /api/carts/:id/cart', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(24)}/cart`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder eliminar cart /api/carts/:id/cart', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(23)}/cart`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder eliminar cart /api/carts/:id/cart', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(25)}/cart`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe agregar un producto a cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.put(`/api/carts/${cart._id}/products/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Product Id");
    });
    it('ZodError: Fallo donde el repositorio debe agregar un producto a cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.put(`/api/carts/${cart._id}/products/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe agregar un producto a cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.put(`/api/carts/${cart._id}/products/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe agregar un producto a cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.put(`/api/carts/${faker.string.numeric(24)}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe agregar un producto a cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.put(`/api/carts/${faker.string.numeric(23)}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe agregar un producto a cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.put(`/api/carts/${faker.string.numeric(25)}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe eliminar un producto de cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.delete(`/api/carts/${cart._id}/products/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual('Not Found Product Id');
    });
    it('ZodError: Fallo donde el repositorio debe eliminar un producto de cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.delete(`/api/carts/${cart._id}/products/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe eliminar un producto de cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.delete(`/api/carts/${cart._id}/products/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe eliminar un producto de cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(24)}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe eliminar un producto de cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(23)}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe eliminar un producto de cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(25)}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe eliminar un producto de cart /api/carts/:id/products/:pid', async function (){
        const result = await requester.delete(`/api/carts/${cart._id}/products/${productId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual('Not Found Product in Cart');
    });
    it('Fallo donde el repositorio debe eliminar todos los productos de cart /api/carts/:id', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe eliminar todos los productos de cart /api/carts/:id', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe eliminar todos los productos de cart /api/carts/:id', async function (){
        const result = await requester.delete(`/api/carts/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('Fallo donde el repositorio debe eliminar todos los productos de cart /api/carts/:id', async function (){
        const result = await requester.delete(`/api/carts/${cart._id}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual('Not Found Products in Cart');
    });
});
