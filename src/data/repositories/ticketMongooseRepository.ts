import ticketSchema from "../models/ticketSchema";

class TicketMongooseRepository{
    async checkout(data:object){
        const document = await ticketSchema.create(data);

        return document;
    }

    async getAllTickets(){
        const ticketDocuments = await ticketSchema.find();

        return ticketDocuments;
    }
}

export default TicketMongooseRepository;
