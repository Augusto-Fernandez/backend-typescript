import mongoose, { InferSchemaType, Schema } from "mongoose";

const ticketSchema = new Schema({
    code: { type: Schema.Types.String, required: true },
    purchase_datetime: { type: Schema.Types.String, required: true },
    amount: { type: Schema.Types.Number, required: true },
    purchaser: { type: Schema.Types.String, required: true }
}, { timestamps: true });

type ticket = InferSchemaType<typeof ticketSchema>;

export default mongoose.model<ticket>("Ticket", ticketSchema);
