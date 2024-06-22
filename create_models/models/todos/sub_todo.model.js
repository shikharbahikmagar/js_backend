import mongoose from 'mongoose';

const subTodoSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },

    description: {

        type: String,
        required: true,
        unique: true,

    }, 

   created_by: {
        type:   mongoose.Schema.types.ObjectId,
        ref: "User",
    },


}, {timestamps: true});

export const SubTodo = mongoose.model('SubTodo', subTodoSchema);