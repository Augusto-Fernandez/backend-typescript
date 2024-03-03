import productSchema from "../models/productSchema";

class ProductMongooseRepository{
    async docCount(){
        return productSchema.countDocuments();
    }
    
    async getAll(limit:number | undefined, page:number | undefined) {
        const productDocuments = await productSchema.paginate({limit, page});

        return {
            status: "success",
            payload: {
                docs: productDocuments?.docs,
                ...productDocuments
            }
        };
    }

    async getAsc() {
        const productDocuments = await productSchema.find().sort({ price: 1 });

        return productDocuments;
    }

    async getDesc() {
        const productDocuments = await productSchema.find().sort({ price: -1 });

        return productDocuments;
    }

    async getOne(id: string) {
        const document = await productSchema.findOne({ _id: id });

        return document;
    }

    async create(data:object) {
        const document = await productSchema.create(data);

        return document;
    }

    async updateOne(id: string, data: object) {
        const document = await productSchema.findByIdAndUpdate({ _id: id }, data, { new: true });

        return document;
    }

    async deleteOne(id: string) {
        return productSchema.deleteOne({ _id: id });
    }
}

export default ProductMongooseRepository;