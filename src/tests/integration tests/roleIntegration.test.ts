import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import initServer from "../app";
import UserMongooseRepository from "../../data/repositories/userMongooseRepository";
import SessionManager from "../../domain/managers/sessionManager";

describe("Testing Role Endpoints Success", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    let jwt: string;

    let roleId: string;

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
    it('Creacion de rol /api/roles/', async function () {
        const payload = {
            name: "Prueba",
            permissions:[
                "Rol de Prueba"
            ]
        };

        const result = await requester.post('/api/roles/').set('Authorization', `Bearer ${jwt}`).send(payload);

        const { body, status } = result;

        roleId=body._id;

        expect(status).toEqual(201);
        expect(body.name).toEqual(payload.name);
        expect(body.permissions).toEqual(payload.permissions);
    });
    it('El repositorio debe devolver un arreglo', async function () {
        const result = await requester.get('/api/roles/').set('Authorization', `Bearer ${jwt}`);
    
        const { status } = result;
        expect(status).toEqual(200);
    });
    it('El repositorio debe poder encontrar un rol /api/roles/:id', async function (){
        const result = await requester.get(`/api/roles/${roleId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status } = result;
        expect(status).toEqual(200);
    });
    it('El repositorio debe poder actualizar un role /api/roles/:id', async function (){
        const update = {
            name: "Update Prueba",
            permissions:[
                "Update Rol de Prueba"
            ]
        };

        const result = await requester.put(`/api/roles/${roleId}`).set('Authorization', `Bearer ${jwt}`).send(update);

        const { body, status } = result;

        expect(status).toEqual(200);
        expect(body.name).toEqual(update.name);
        expect(body.permissions).toEqual(update.permissions);
    });
    it('El repositorio debe poder eliminar un rol /api/roles/:id', async function (){
        const result = await requester.delete(`/api/roles/${roleId}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status } = result;
        expect(status).toEqual(200);
    });
});

describe("Testing Role Endpoints Fail", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    let jwt: string;

    let roleId: string;

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
            name: "Prueba",
            permissions:[
                "Rol de Prueba"
            ]
        };

        const result = await requester.post('/api/roles/').set('Authorization', `Bearer ${jwt}`).send(payload);

        const { body } = result;

        roleId = body._id;
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('Fallo donde el repositorio debe poder encontrar un rol /api/roles/:id', async function (){
        const result = await requester.get(`/api/roles/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder encontrar un rol /api/roles/:id', async function (){
        const result = await requester.get(`/api/roles/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder encontrar un rol /api/roles/:id', async function (){
        const result = await requester.get(`/api/roles/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('ZodError: Fallo creacion de rol /api/roles/', async function () {
        const payload = {
            name: "Prueba"
        };

        const result = await requester.post('/api/roles').set('Authorization', `Bearer ${jwt}`).send(payload);
        
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('El repositorio debe fallar la actualizar un rol /api/roles/:id', async function (){
        const update = {
            name: "Prueba",
            permissions:[
                "Update Rol de Prueba"
            ]
        };

        const result = await requester.put(`/api/roles/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`).send(update);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: El repositorio debe fallar la actualizar un rol /api/roles/:id', async function (){
        const update = {
            name: "Prueba",
            permissions:[
                "Update Rol de Prueba"
            ]
        };

        const result = await requester.put(`/api/roles/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`).send(update);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: El repositorio debe fallar la actualizar un rol /api/roles/:id', async function (){
        const update = {
            name: "Prueba",
            permissions:[
                "Update Rol de Prueba"
            ]
        };

        const result = await requester.put(`/api/roles/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`).send(update);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
    it('ZodError: El repositorio debe fallar la actualizar un rol /api/roles/:id', async function (){
        const update = {
            name: "Prueba"
        };

        const result = await requester.put(`/api/roles/${roleId}`).set('Authorization', `Bearer ${jwt}`).send(update);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('Fallo donde el repositorio debe poder eliminar un rol /api/roles/:id', async function (){
        const result = await requester.delete(`/api/roles/${faker.string.numeric(24)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found Id");
    });
    it('ZodError: Fallo donde el repositorio debe poder eliminar un rol /api/roles/:id', async function (){
        const result = await requester.delete(`/api/roles/${faker.string.numeric(23)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_small");
    });
    it('ZodError: Fallo donde el repositorio debe poder eliminar un rol /api/roles/:id', async function (){
        const result = await requester.delete(`/api/roles/${faker.string.numeric(25)}`).set('Authorization', `Bearer ${jwt}`);
    
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("too_big");
    });
});

