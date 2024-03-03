import roleSchema from "../models/roleSchema";

class RoleMongooseRepository{
    async docCount(){
        return roleSchema.countDocuments();
    }

    async getAll(limit:number | undefined, page:number | undefined) {
        const roleDocuments = await roleSchema.paginate({limit, page});

        return {
            status: "success",
            payload: {
                docs: roleDocuments?.docs,
                ...roleDocuments
            }
        };
    }

    async getOne(id: string) {
        const document = await roleSchema.findOne({ _id: id });

        return document;
    }

    async create(data:object) {
        const document = await roleSchema.create(data);

        return document;
    }

    async updateOne(id: string, data: object) {
        const document = await roleSchema.findByIdAndUpdate({ _id: id }, data, { new: true });

        return document;
    }

    async deleteOne(id: string) {
        return roleSchema.deleteOne({ _id: id });
    }
}

export default RoleMongooseRepository;
