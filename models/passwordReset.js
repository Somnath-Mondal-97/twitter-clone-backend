import mongoose,{Schema} from "mongoose";

const passwodResetSchema = Schema({
    userId:{type:String,unique:true},
    email:{type:String,unique:true},
    token:String,
    createdAt:Date,
    expiresAt:Date
})

const PasswordReset = mongoose.model("PasswordReset",passwodResetSchema)

export default PasswordReset