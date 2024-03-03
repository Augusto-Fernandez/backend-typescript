import mongoose from "mongoose";

class MongooseAdapter {
    async init(uri:string) {
        await mongoose.connect(uri);
        console.log("Mongoose Connected");
    }
    async close(){
        try{
            await mongoose.disconnect();
            console.log("Mongoose Disconnected");
        }catch(e){
            console.log("Error disconnecting DB");
        }
    }
}

export default MongooseAdapter;