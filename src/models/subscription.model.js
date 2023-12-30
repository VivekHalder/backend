import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subcriber : {
        //one who is subscribing is also a User.
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        //one to whom 'subscriber is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true } );

export const Subcription = mongoose.model("Subcription", subscriptionSchema);