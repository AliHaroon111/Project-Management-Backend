import mongoose from "mongoose";


const connecctDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("✅ MongoDB connected 😃");
        
    } catch (error) {
        console.error("❌MongDB connection error",error)
        process.exit(1)
    }
}

export default connecctDB