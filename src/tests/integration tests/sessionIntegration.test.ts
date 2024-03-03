import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import initServer from "../app";

describe("Testing Session Endpoints Success", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    type userPayload = {
        userName:string,
        email:string,
        password:string
    }

    let payload:userPayload;
    let jwt: string;

    beforeAll(async function () {
        await db.init(uri);
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('Creacion de cuenta /api/sessions/signup', async function () {
        payload = {
            userName: `${faker.person.firstName()} +++++++++`,
            email: faker.internet.email(),
            password: "12345678"
        };

        const result = await requester.post('/api/sessions/signup').send(payload);
        const { body, status } = result;

        expect(status).toEqual(201);
        expect(body.email).toEqual(payload.email);
    });
    it('Login de cuenta /api/sessions/login', async function () {
        const result = await requester.post('/api/sessions/login').send({email: payload.email, password: payload.password});
        const { body, status } = result;
        expect(status).toEqual(200);
        expect(body.message).toEqual("Login success!");
        jwt = body.sessionLogin;
    });
    it('Current /api/sessions/current', async function () {
        const result = await requester.get('/api/sessions/current').set('Authorization', `Bearer ${jwt}`);
        const { body, status } = result;
        expect(status).toEqual(200);
        expect(body.payload._doc.email).toEqual(payload.email);
    });
    it('Change Password /api/sessions/change-password', async function () {
        const result = await requester.post('/api/sessions/change-password').set('Authorization', `Bearer ${jwt}`).send({password: '87654321'});
        const { body, status } = result;

        expect(status).toEqual(200);
        expect(body.message).toEqual("User changed password.");
    });
});

describe("Testing Session Endpoints Fail", async () => {
    const { app, db } = await initServer();

    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const application = app.callback();
    const requester = supertest.agent(application);

    type userPayload = {
        userName:string,
        email:string,
        password:string
    }

    let payload:userPayload;
    let jwt: string;

    beforeAll(async function () {
        await db.init(uri);

        payload = {
            userName: "userr",
            email: "user@user.com",
            password: "12345678"
        };

        await requester.post('/api/sessions/signup').send(payload);

        const result = await requester.post('/api/sessions/login').send({email: payload.email, password: payload.password});
        const { body } = result;
        jwt = body.sessionLogin;
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('Fallo en creacion de cuenta /api/sessions/signup', async function () {
        const result = await requester.post('/api/sessions/signup').send(payload);
        
        const { body, status } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Login failed, email already used.");
    });
    it('ZodError: Fallo en creacion de cuenta /api/sessions/signup', async function () {
        const result = await requester.post('/api/sessions/signup').send({userName: payload.userName, password: payload.password});
        
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('Fallo en login de cuenta /api/sessions/login', async function () {
        const result = await requester.post('/api/sessions/login').send({email: faker.internet.email(), password: payload.password});
        
        const { body, status } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Not Found User Email");
    });
    it('Fallo en login de cuenta /api/sessions/login', async function () {
        const result = await requester.post('/api/sessions/login').send({email: payload.email, password: "87654321"});
        
        const { body, status } = result;
        expect(status).toEqual(404);
        expect(body.message).toEqual("Login failed, invalid password.");
    });
    it('ZodError: Fallo en login de cuenta /api/sessions/login', async function () {
        const result = await requester.post('/api/sessions/login').send({email: payload.email});
        
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
    it('Fallo en current /api/sessions/current', async function () {
        const result = await requester.get('/api/sessions/current').set('Authorization', `Bearer`);
        
        const { status, body } = result;
        expect(status).toEqual(403);
        expect(body.error).toEqual('Authentication error');
    });
    it('ZodError: Change Password /api/sessions/change-password', async function () {
        const result = await requester.post('/api/sessions/change-password').set('Authorization', `Bearer ${jwt}`).send({});
        
        const { status, body } = result;
        expect(status).toEqual(400);
        expect(body.message[0].code).toEqual("invalid_type");
    });
});
