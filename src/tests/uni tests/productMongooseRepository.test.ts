import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';

import initServer from "../app";
import ProductMongooseRepository from "../../data/repositories/productMongooseRepository";

describe("Testing Product Mongoose Repository", async () => {
    const { db } = await initServer();
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const productRepository = new ProductMongooseRepository();

    type productId = {
        readonly _id:string
    }

    let product:productId;

    beforeAll(async function () {
        await db.init(uri);
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('El repositorio debe ser una instancia de ProductMongooseRepository', function () {
        expect(productRepository instanceof ProductMongooseRepository).toBeTruthy();
    });
    it('El repositorio debe poder crear un producto', async function () {
        const payload = {
            title: faker.lorem.word(),
            description: faker.lorem.sentence(),
            price: faker.number.int(),
            thumbnail: faker.lorem.word(),
            code: faker.string.alphanumeric(),
            stock: faker.number.int(),
            status: true
        };

        const productDocument = await productRepository.create(payload);
        product = productDocument.toObject();

        expect(productDocument.title).toEqual(payload.title);
        expect(productDocument.description).toEqual(payload.description);
        expect(productDocument.price).toEqual(payload.price);
        expect(productDocument.thumbnail).toEqual(payload.thumbnail);
        expect(productDocument.code).toEqual(payload.code);
        expect(productDocument.stock).toEqual(payload.stock);
        expect(productDocument.status).toEqual(payload.status);
    });
    it('El repositorio debe devolver la cantidad de documentos', async function () {
        return productRepository
            .docCount()
            .then(result =>{
                expect(result).toBeTypeOf("number");
            }
        );
    });
    it('El repositorio debe devolver un arreglo', async function () {
        return productRepository
            .getAll(1,1)
            .then(result => {
                expect(Array.isArray(result.payload.docs)).toBe(true);
                expect(result.payload.limit).toEqual(1);
            }
        );
    });
    it('El repositorio debe devolver un arreglo en orden ascendente', async function () {
        return productRepository
            .getAsc()
            .then(result => {
                expect(Array.isArray(result)).toBe(true);
            }
        );
    });
    it('El repositorio debe devolver un arreglo en orden descendente', async function () {
        return productRepository
            .getDesc()
            .then(result => {
                expect(Array.isArray(result)).toBe(true);
            }
        );
    });
    it('El repositorio debe poder encontrar un producto', async function (){
        return productRepository
            .getOne(product._id)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object'); 
                expect(result).toHaveProperty('id');
            });
    });
    it('El repositorio debe poder actualizar un producto', async function (){
        const update = {
            title: faker.lorem.word(),
            description: faker.lorem.sentence(),
            price: faker.number.int(),
            thumbnail: faker.lorem.word(),
            code: faker.string.alphanumeric(),
            stock: faker.number.int(),
            status: true
        };

        return productRepository
            .updateOne(product._id, update)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object'); 
                expect(result).toHaveProperty('id');
                expect(result?.title).toEqual(update.title);
                expect(result?.description).toEqual(update.description);
                expect(result?.price).toEqual(update.price);
                expect(result?.thumbnail).toEqual(update.thumbnail);
                expect(result?.code).toEqual(update.code);
                expect(result?.stock).toEqual(update.stock);
                expect(result?.status).toEqual(update.status);
            });
    });
    it('El repositorio debe poder eliminar un producto', async function (){
        return productRepository
            .deleteOne(product._id)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
            });
    });
});