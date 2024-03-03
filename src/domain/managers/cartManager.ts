import container from "../../container";
import { ProductRepositoryModelMethods } from "./productManager";
import MailService from "../../shared/mailService";
import stripeCheckout from "../../shared/stripe";

type cartItem = {
    id: string;
    quantity: number;
}

type cart = {
    items: cartItem[],
    enable: boolean
}

type ticket = {
    code: string,
    purchase_datetime: string,
    amount: number,
    purchaser: string 
}

type user = {
    userName: string,
    email: string
}

export interface CartRepositoryModelMethods {
    docCount():Promise<number>;
    getAll(limit:number | undefined, page:number | undefined): Promise<cart[]>;
    getOne(id: string): Promise<cart>;
    create(): Promise<cart>;
    updateOne(id: string, data: cartItem[]): Promise<cart>;
    deleteCart(id: string): Promise<void>;
    addToCart(cartId:string, cartProductId:string):Promise<cart>;
    updatedCart(cartId:string, cartProductId:string, index:number):Promise<cart>;
    deleteOne(cartId:string, cartProductId:string):Promise<cart>;
    deleteAll(id:string):Promise<cart>;
}

interface TicketRepositoryModelMethods {
    checkout(data:object):Promise<ticket>;
    getAllTickets(): Promise<ticket[]>;
}

class CartManager{
    private cartRepository: CartRepositoryModelMethods;
    private productRepository: ProductRepositoryModelMethods;
    private ticketRepository: TicketRepositoryModelMethods;

    constructor() {
        this.cartRepository = container.resolve('CartRepository');
        this.productRepository = container.resolve('ProductRepository');
        this.ticketRepository = container.resolve('TicketRepository');
    }

    async getAll(limit:number | undefined, page:number | undefined){
        let resLimit = limit;

        if(!limit){
            resLimit = await this.cartRepository.docCount();
        }

        return this.cartRepository.getAll(resLimit, page);
    }

    async getOne(id:string) {
        const cart = await this.cartRepository.getOne(id);

        if(cart===null){
            throw new Error('Not Found Id');
        }

        return cart;
    }

    async create() {
        return this.cartRepository.create();
    }

    async updateOne(id:string, data:cartItem[]){
        const validateId = await this.cartRepository.getOne(id);

        if(validateId===null){
            throw new Error('Not Found Id');
        }

        const validatedProducts:string[] = [];

        await Promise.all(data.map(async (prod) => {
            const validateProduct = await this.productRepository.getOne(prod.id);

            if (validateProduct === null) {
                throw new Error('Not Found Product Id');
            }

            const idExists = validatedProducts.find(existingId => existingId === validateProduct.id);

            if (idExists) {
                throw new Error('Product Already Added');
            }

            validatedProducts.push(validateProduct.id);
        }));
        
        return this.cartRepository.updateOne(id, data);
    }

    async deleteCart(id: string) {
        const validateId = await this.cartRepository.getOne(id);

        if(validateId===null){
            throw new Error('Not Found Id');
        }

        return this.cartRepository.deleteCart(id);
    }

    async addToCart(cartId:string, productId:string) {
        const cart = await this.cartRepository.getOne(cartId);
        
        if (cart === null) {
            throw new Error('Not Found Id');
        }

        const validateProduct= await this.productRepository.getOne(productId);

        if (validateProduct === null) {
            throw new Error('Not Found Product Id');
        }

        const productExist = cart.items.findIndex(item => item.id === productId);

        if (productExist !== -1) {
            const update = cart.items[productExist].quantity + 1;
            console.log(update);
            return this.cartRepository.updatedCart(cartId, productId, update);
        }

        return this.cartRepository.addToCart(cartId, productId);
    }

    async deleteOne(cartId:string, productId:string) {
        const cart = await this.cartRepository.getOne(cartId);
        if (cart === null) {
            throw new Error('Not Found Id');
        }

        const product = await this.productRepository.getOne(productId);

        if (product === null) {
            throw new Error('Not Found Product Id');
        }
        const productExist = cart.items.findIndex(item => item.id === productId);

        if (productExist === -1) {
            throw new Error('Not Found Product in Cart');
        }

        return this.cartRepository.deleteOne(cartId, productId);
    }

    async deleteAll(id:string) {
        const cart = await this.cartRepository.getOne(id);
        
        if (cart === null) {
            throw new Error('Not Found Id');
        }

        if(cart.items.length < 1){
            throw new Error('Not Found Products in Cart');
        }

        return this.cartRepository.deleteAll(id);
    }

    async checkout(id:string, user:user){
        const cart = await this.cartRepository.getOne(id);
        if (cart === null) {
            throw new Error('Not Found Id');
        }

        if(cart.items.length===0){
            throw new Error('Empty Cart');
        }

        let code = 1;
        const ticketCode = await this.ticketRepository.getAllTickets();
        await Promise.all(ticketCode.map(async (ticket) => {
            if(ticket.code === code.toString()){
                code++;
            }
        }));

        const onStock:cartItem[] = [];
        const outOfStock:cartItem[] = [];
        let totalAmount = 0;

        await Promise.all(cart.items.map(async (item) => {
            const product = await this.productRepository.getOne(item.id);
            if(item.quantity===0){
                outOfStock.push(item);
            }else if(item.quantity>product.stock && product.stock>0){
                onStock.push({...item, quantity: item.quantity-product.stock});
                outOfStock.push({...item, quantity: 0});
            }else if(item.quantity>product.stock && product.stock===0){
                outOfStock.push({...item, quantity: 0});
            }else{
                onStock.push(item);
            }
        }));

        await Promise.all(onStock.map(async (prod) => {
            const product = await this.productRepository.getOne(prod.id);
            totalAmount+=product.price*prod.quantity;
            await this.productRepository.updateOne(prod.id, {...product, stock: product.stock - prod.quantity});
        }));

        if(onStock.length===0){
            throw new Error('Empty Cart, Out Of Stock');
        }

        await this.cartRepository.deleteCart(id);

        const dto = {
            code: code.toString(),
            purchase_datetime: new Date().toISOString(),
            amount: totalAmount,
            purchaser: user.email
        };

        stripeCheckout(totalAmount);

        const purchaseMail = new MailService();
        await purchaseMail.send('purchaseConfirmation.hbs', {
            userName: user.userName,
            code: code,
            totalAmount: totalAmount }, user.email, 'Purchase Confirmation');

        return this.ticketRepository.checkout(dto);
    }
}

export default CartManager;
