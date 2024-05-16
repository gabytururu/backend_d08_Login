import mongoose from "mongoose";

const sessionsCollection = 'sessions'

const sessionsSchema = new mongoose.Schema(
    {
        nombre:String,
        email:{
            type: String,
            unique: true,
        },
        password:String,
        rol:{
            type:String,
            default:"user"
        }
    },
    {timestamps:true}
)

export const sessionsModel = mongoose.model(
    sessionsCollection,
    sessionsSchema,
)