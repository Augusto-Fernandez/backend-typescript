import cartSchema from "../models/cartSchema";

class CartMongooseRepository{
    async docCount(){
        return cartSchema.countDocuments();
    }

    async getAll(limit:number | undefined, page:number | undefined) {
        const cartDocuments = await cartSchema.paginate({limit, page});

        return {
            status: "success",
            payload: {
                docs: cartDocuments?.docs,
                ...cartDocuments
            }
        };
    }

    async getOne(id: string) {
        const document = await cartSchema.findOne({ _id: id });

        return document;
    }

    async create() {
        return await cartSchema.create({});
    }

    async updateOne(id: string, data: object[]) {
        const document = await cartSchema.findByIdAndUpdate({ _id: id }, { $set: { items: data } }, { new: true });

        return document;
    }

    async deleteCart(id: string) {
        return cartSchema.deleteOne({ _id: id });
    }

    async addToCart(cartId:string, cartProductId:string) {
        const document = await cartSchema.findByIdAndUpdate(
            cartId,
            { $push: { items: { id: cartProductId, quantity: 1 } } },
            { new: true }
        );

        return document;
    }

    async updatedCart(cartId:string, cartProductId:string, index:number) {
        const document = await cartSchema.findOneAndUpdate(
            { _id: cartId, "items.id": cartProductId },
            { $set: { "items.$.quantity": index } },
            { new: true }
        );

        return document;
    }

    async deleteOne(cartId:string, cartProductId:string) {
        const document = await cartSchema.findOneAndUpdate(
            { _id: cartId },
            { $pull: { items: { id: cartProductId } } },
            { new: true }
        );

        return document;
    }

    async deleteAll(id:string) {
        const document = await cartSchema.findOneAndUpdate(
            { _id: id },
            { $set: { items: [] } },
            { new: true }
        );

        return document;
    }
}

export default CartMongooseRepository;
