import mongoose, { InferSchemaType, Schema } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

const cartSchema = new Schema({
    items: { type: Schema.Types.Array, default: []},
    enable: {type: Schema.Types.Boolean, default: true}
}, { timestamps: true });

cartSchema.plugin(mongoosePagination);

type cart = InferSchemaType<typeof cartSchema>;

export default mongoose.model<cart, Pagination<cart>>("Cart", cartSchema);