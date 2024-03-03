import mongoose, { InferSchemaType, Schema } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

const productSchema = new Schema({
    title: {type: Schema.Types.String, require: true},
    description: {type: Schema.Types.String, require: true},
    price: {type: Schema.Types.Number, require: true},
    thumbnail: {type: Schema.Types.String, require: true},
    code: {type: Schema.Types.String, require: true},
    stock: {type: Schema.Types.Number, require: true},
    status: {type: Schema.Types.Boolean, require: true},
    enable: {type: Schema.Types.Boolean, default: true}
}, { timestamps: true });

productSchema.plugin(mongoosePagination);

type product = InferSchemaType<typeof productSchema>;

export default mongoose.model<product, Pagination<product>>("Product", productSchema);
