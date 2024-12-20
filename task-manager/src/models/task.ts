import mongoose, { Schema, Document } from 'mongoose';

// Define the Task interface
export interface ITask extends Document {
    name: string;
    status: boolean;
}

// Create the Task schema
const TaskSchema: Schema = new Schema({
    name: { type: String, required: true },
    status: { type: Boolean, required: true }
});

// Create the Task model
const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;
