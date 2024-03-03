import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import initServer from "../app";
import UserMongooseRepository from "../../data/repositories/userMongooseRepository";
import SessionManager from "../../domain/managers/sessionManager";

describe("Testing Product Endpoints Success", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    let jwt: string;

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
    it('Creacion de producto /api/products/', async function () {
        const payload = {
            title: "Test Product",
            description: "Test Description",
            price: 1,
            thumbnail: "Test Thumbnail",
            code: "1111111111111",
            stock: 1,
            status: true,
        };

        const result = await requester.post('/api/products/').set('Authorization', `Bearer ${jwt}`).send(payload);

        const { body, status } = result;

        productId = body._id;

        expect(status).toEqual(201);
        expect(body.title).toEqual(payload.title);
        expect(body.description).toEqual(payload.description);
        expect(body.price).toEqual(payload.price);
        expect(body.thumbnail).toEqual(payload.thumbnail);
        expect(body.code).toEqual(payload.code);
        expect(body.stock).toEqual(payload.stock);
        expect(body.status).toEqual(payload.status);
    });
    it('El repositorio debe devolver un arreglo', async function () {
        const result = await requester.get('/api/products/').set('Authorization', `Bearer ${jwt}`);

        const { status } = result;
        expect(status).toEqual(200);
    });
    it('El repositorio debe poder encontrar un producto /api/products/:id', async function () {
        const result = await requester.get(`/api/products/${productId}`).set('Authorization', `Bearer ${jwt}`);

        const { status } = result;
        expect(status).toEqual(200);
    });
    it('El repositorio debe poder actualizar un producto /api/products/:id', async function () {
        const update = {
            title: "Update Test Product",
            description: "Update Test Description",
            price: 2,
            thumbnail: "Update Test Thumbnail",
            code: "222222222222",
            stock: 2,
            status: true,
        };

        const result = await requester.put(`/api/products/${productId}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { body, status } = result;

        expect(status).toEqual(200);
        expect(body.title).toEqual(update.title);
        expect(body.description).toEqual(update.description);
        expect(body.price).toEqual(update.price);
        expect(body.thumbnail).toEqual(update.thumbnail);
        expect(body.code).toEqual(update.code);
        expect(body.stock).toEqual(update.stock);
        expect(body.status).toEqual(update.status);
    });
    it('El repositorio debe poder eliminar un producto /api/products/:id', async function (){
        const result = await requester.delete(`/api/products/${productId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status } = result;
        expect(status).toEqual(200);
    });
});

describe("Testing Product Endpoints Fail", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    let jwt: string;

    let productId: string;

    const userRepository = new UserMongooseRepository();

    beforeAll(async function () {
        await db.init(uri);

        const signup = {
            userName: "admin",
            email: "admin@admin.com",
            password: "12345678"
        };

        const sessionManager = new SessionManager();
        await sessionManager.signup(signup);

        const registedUser = await userRepository.getOneByEmail(signup.email);
        await userRepository.updateOne(registedUser?.id, {
            userName: registedUser?.userName,
            email: registedUser?.email,
            password: registedUser?.password,
            isAdmin: true
        });

        const login = await requester.post('/api/sessions/login').send({ email: signup.email, password: signup.password });
        jwt = login.body.sessionLogin;

        const payload = {
            title: "Test Product",
            description: "Test Description",
            price: 1,
            thumbnail: "Test Thumbnail",
            code: "1111111111111",
            stock: 1,
            status: true,
        };

        const result = await requester.post('/api/products/').set('Authorization', `Bearer ${jwt}`).send(payload);

        const { body } = result;

        productId = body._id;
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('Fallo donde el repositorio debe poder encontrar un producto /api/products/:id', async function (){
        const result = await requester.get(`/api/products/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder encontrar un producto /api/products/:id', async function (){
        const result = await requester.get(`/api/products/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder encontrar un producto /api/products/:id', async function (){
        const result = await requester.get(`/api/products/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('ZodError: Fallo creacion de producto /api/products/', async function () {
        const payload = {
            title: "Test Product",
            description: "Test Description",
            price: 1,
            thumbnail: "Test Thumbnail",
        };

        const result = await requester.post('/api/products').set('Authorization', `Bearer ${jwt}`).send(payload);
        
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('El repositorio debe fallar la actualizar un producto /api/products/:id', async function (){
        const update = {
            title: "Update Test Product",
            description: "Update Test Description",
            price: 2,
            thumbnail: "Update Test Thumbnail",
            code: "222222222222",
            stock: 2,
            status: true,
        };

        const result = await requester.put(`/api/products/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`).send(update);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: El repositorio debe fallar la actualizar un producto /api/products/:id', async function (){
        const update = {
            title: "Update Test Product",
            description: "Update Test Description",
            price: 2,
            thumbnail: "Update Test Thumbnail",
            code: "222222222222",
            stock: 2,
            status: true,
        };

        const result = await requester.put(`/api/products/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`).send(update);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: El repositorio debe fallar la actualizar un producto /api/products/:id', async function (){
        const update = {
            title: "Update Test Product",
            description: "Update Test Description",
            price: 2,
            thumbnail: "Update Test Thumbnail",
            code: "222222222222",
            stock: 2,
            status: true,
        };

        const result = await requester.put(`/api/products/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`).send(update);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('ZodError: El repositorio debe fallar la actualizar un producto /api/products/:id', async function (){
        const update = {
            title: "Update Test Product",
            description: "Update Test Description",
            price: 2,
            thumbnail: "Update Test Thumbnail"
        };

        const result = await requester.put(`/api/products/${productId}`).set('Authorization', `Bearer ${jwt}`).send(update);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('Fallo donde el repositorio debe poder eliminar un producto /api/products/:id', async function (){
        const result = await requester.delete(`/api/products/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder eliminar un producto /api/products/:id', async function (){
        const result = await requester.delete(`/api/products/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder eliminar un producto /api/products/:id', async function (){
        const result = await requester.delete(`/api/products/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
});
