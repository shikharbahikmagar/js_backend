import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({

    content: {
        type: String,
        required: true,
    },

    complete: {

        type: Boolean,
        Default: false,

    }, 

   created_by: {
        type:   mongoose.Schema.types.ObjectId,
        ref: "User",
    },

    subTodos: [
        
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubTodo"
        }
    ]


}, {timestamps: true});

export const Todo = mongoose.model('Todo', todoSchema);