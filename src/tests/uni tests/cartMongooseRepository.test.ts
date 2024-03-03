import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';

import initServer from "../app";
import CartMongooseRepository from "../../data/repositories/cartMongooseRepository";
import ProductMongooseRepository from "../../data/repositories/productMongooseRepository";

describe("Testing Cart Mongoose Repository", async () => {
    const { db } = await initServer();
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const cartRepository = new CartMongooseRepository();
    const productRepository = new ProductMongooseRepository();

    type cartItem = {
        id: string;
        quantity: number;
    }

    type cartId = {
        readonly _id: string,
        items: cartItem[]
    }

    type productId = {
        readonly _id: string
    }

    let cart:cartId;
    let product:productId;
    
    beforeAll( async function () {
        await db.init(uri);
    });
    afterAll(async function () {
        await mongod.stop();
        await db.close();
    });
    it('El repositorio debe ser una instancia de CartMongooseRepository', function () {
        expect(cartRepository instanceof CartMongooseRepository).toBeTruthy();
    });
    it('El repositorio debe poder crear un cart', async function () {
        const cartDocument = await cartRepository.create();
        cart = cartDocument.toObject();

        expect(cartDocument._id).toBeTruthy();
        expect(cartDocument.items).toBeTruthy();
    });
    it('El repositorio debe devolver la cantidad de documentos', async function () {
        return cartRepository
            .docCount()
            .then(result =>{
                expect(result).toBeTypeOf("number");
            }
        );
    });
    it('El repositorio debe poder encontrar un cart', async function (){
        return cartRepository
            .getOne(cart._id)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object'); 
                expect(result).toHaveProperty('id');
        });
    });
    it('El repositorio debe poder actualizar un cart', async function (){
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

        const update = [
            {
                id: product._id,
                quantity: 1
            }
        ];

        return cartRepository
            .updateOne(cart._id, update)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
                expect(typeof result).toBe('object'); 
                expect(result).toHaveProperty('id');
                expect(result?.id).toBeTruthy();
                expect(result?.items).toStrictEqual(update);
            });
    });
    it('El repositorio debe poder agregar producto a cart', async function (){
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

        const cartDocument = await cartRepository.addToCart(cart._id, product._id);
        cart.items = cartDocument?.items as unknown as cartItem[];

        const isProductInCart = cart.items.some(item => JSON.stringify(item.id) === JSON.stringify(product._id));

        expect(cartDocument).not.toBeNull();
        expect(cartDocument).toBeDefined();
        expect(typeof cartDocument).toBe('object'); 
        expect(cartDocument).toHaveProperty('id');
        expect(cartDocument?._id).toBeTruthy();
        expect(cart.items.length).toBeGreaterThan(0);
        expect(isProductInCart).toBeTruthy();
    });
    it('El repositorio debe poder actualizar un producto de cart', async function (){
        const cartDocument = await cartRepository.updatedCart(cart._id, product._id, 2);
        cart.items = cartDocument?.items as unknown as cartItem[];

        const foundItem = cart.items.find(item => JSON.stringify(item.id) === JSON.stringify(product._id));

        expect(cartDocument).not.toBeNull();
        expect(cartDocument).toBeDefined();
        expect(typeof cartDocument).toBe('object'); 
        expect(cartDocument).toHaveProperty('id');
        expect(cartDocument?._id).toBeTruthy();
        expect(cart.items.length).toBeGreaterThan(0);
        expect(foundItem).toBeDefined();
        expect(foundItem?.quantity).toBe(2);
    });
    it('El repositorio debe poder borrar un producto de cart', async function (){
        const cartDocument = await cartRepository.deleteOne(cart._id, product._id);
        cart.items = cartDocument?.items as unknown as cartItem[];

        const notInCart = cart.items.every(item => item.id !== product._id);

        expect(cartDocument).not.toBeNull();
        expect(cartDocument).toBeDefined();
        expect(typeof cartDocument).toBe('object'); 
        expect(cartDocument).toHaveProperty('id');
        expect(cartDocument?._id).toBeTruthy();
        expect(notInCart).toBeTruthy();
    });
    it('El repositorio debe poder borrar todos los productos de cart', async function (){
        const cartDocument = await cartRepository.deleteAll(cart._id);
        cart.items = cartDocument?.items as unknown as cartItem[];

        expect(cartDocument).not.toBeNull();
        expect(cartDocument).toBeDefined();
        expect(typeof cartDocument).toBe('object'); 
        expect(cartDocument).toHaveProperty('id');
        expect(cartDocument?._id).toBeTruthy();
        expect(cart.items.length).toBe(0);
    });
    it('El repositorio debe poder eliminar un cart', async function (){
        return cartRepository
            .deleteCart(cart._id)
            .then(result => {
                expect(result).not.toBeNull();
                expect(result).toBeDefined();
            });
    });
});
