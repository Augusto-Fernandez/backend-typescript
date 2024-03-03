import mongoose, { InferSchemaType, Schema } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

const userSchema = new Schema({
    userName: { type: Schema.Types.String, unique: true, required: true },
    email: { type: Schema.Types.String, unique: true, required: true },
    cart:[{type: Schema.Types.ObjectId, index: true, ref:'Cart', default: []}],
    role: [{ type: Schema.Types.ObjectId, index: true, ref: 'Role', default: [] }],
    isAdmin: { type: Schema.Types.Boolean, default: false },
    password: { type: Schema.Types.String},
    last_connection: {type: Schema.Types.Date, default: new Date()}
}, { timestamps: true });

userSchema.plugin(mongoosePagination);

type user = InferSchemaType<typeof userSchema>;

export default mongoose.model<user, Pagination<user>>("User", userSchema);
