import userSchema from "../models/userSchema";

class UserMongooseRepository{
    async docCount(){
        return userSchema.countDocuments();
    }

    async getAll(limit:number | undefined, page:number | undefined) {
        const productDocuments = await userSchema.paginate({limit, page});

        return {
            status: "success",
            payload: {
                docs: productDocuments?.docs,
                ...productDocuments
            }
        };
    }

    async getOne(id: string) {
        const userDocument = await userSchema.findOne({ _id: id }).populate(["cart","role"]);

        return userDocument;
    }

    async create(data:object) {
        const userDocument = await userSchema.create(data);

        return userDocument;
    }

    async updateOne(id: string, data: object) {
        const userDocument = await userSchema.findByIdAndUpdate({ _id: id }, data, { new: true });

        return userDocument;
    }

    async deleteOne(id: string) {
        return userSchema.deleteOne({ _id: id });
    }

    async getOneByEmail(email: string){
        const document = await userSchema.findOne({ email }).populate(["cart","role"]);

        return document;
    }

    async addRole(id: string, data: string){
        const document = await userSchema.findByIdAndUpdate(
            id,
            {$push:{role:data}},
            {new: true}
        );

        return document;
    }

    async deleteRole(id:string){
        const document = await userSchema.findOneAndUpdate(
            {_id: id},
            {$set: {role: []}},
            {new: true}
        );
      
        return document;
    }

    async addCart(id:string, cartId:string){
        const document = await userSchema.findByIdAndUpdate(
            id,
            {$push:{cart: cartId}},
            {new: true}
        );

        return document;
    }

    async deleteCart(id:string){
        const document = await userSchema.findOneAndUpdate(
            {_id: id},
            {$set: {cart: []}},
            {new: true}
        );

        return document;
    }
}

export default UserMongooseRepository;
