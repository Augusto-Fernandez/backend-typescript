import mongoose ,{ InferSchemaType, Schema } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

const roleSchema = new Schema({
    name: { type: Schema.Types.String, required: true },
    permissions: [{ type: Schema.Types.String, required: true }]
}, { timestamps: true });

roleSchema.plugin(mongoosePagination);

type role = InferSchemaType<typeof roleSchema>;

export default mongoose.model<role, Pagination<role>>("Role", roleSchema);
