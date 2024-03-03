import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';

import initServer from "../app";
import RoleMongooseRepository from "../../data/repositories/roleMongooseRepository";

describe("Testing Role Mongoose Repository", async () => {
    const { db } = await initServer();
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const roleRepository = new RoleMongooseRepository();

    type roleId = {
        readonly _id:string
    }

    let role:roleId;

    beforeAll( async function () {
       await db.init(uri);
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('El repositorio debe ser una instancia de RoleMongooseRepository', function () {
        expect(roleRepository instanceof RoleMongooseRepository).toBeTruthy();
    });
    it('El repositorio debe poder crear un rol', async function () {
        const payload = {
            name: faker.lorem.word(),
            permissions:[
                faker.lorem.word()
            ]
        };

        const roleDocument = await roleRepository.create(payload);
        role = roleDocument.toObject();

        expect(roleDocument.name).toEqual(payload.name);
        expect(roleDocument.permissions).toStrictEqual(payload.permissions);
    });
    it('El repositorio debe devolver la cantidad de documentos', async function () {
        return roleRepository
            .docCount()
            .then(result =>{
                expect(result).toBeTypeOf("number");
            }
        );
    });
    it('El repositorio debe devolver un arreglo', async function () {
        return roleRepository
            .getAll(1,1)
            .then(result => {
                expect(Array.isArray(result.payload.docs)).toBe(true);
                expect(result.payload.limit).toBe(1);
            }
        );
    });
    it('El repositorio debe poder encontrar un rol', async function (){
        return roleRepository
            .getOne(role._id)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object'); 
                expect(result).toHaveProperty('id');
            });
    });
    it('El repositorio debe poder actualizar un rol', async function (){
        const update = {
            name: faker.lorem.word(),
            permissions:[
                faker.lorem.word()
            ]
        };

        return roleRepository
            .updateOne(role._id, update)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object'); 
                expect(result).toHaveProperty('id');
                expect(result?.name).toEqual(update.name);
                expect(result?.permissions).toStrictEqual(update.permissions);
            });
    });
    it('El repositorio debe poder eliminar un role', async function (){
        return roleRepository
            .deleteOne(role._id)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
            });
    });
});
