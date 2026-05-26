import mongoose from 'mongoose';

const taskSchema = mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        deadline: {
            type: Date,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        dependencies: [{
            task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
            type: { type: String, enum: ['blocking', 'waiting_on'], default: 'blocking' }
        }],
        submissionFile: {
            type: String, // URL or Path
        },
        submissionNote: {
            type: String,
        },
        submittedAt: {
            type: Date,
        },
        subtasks: [
            {
                title: { type: String, required: true },
                completed: { type: Boolean, default: false },
                assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
            }
        ],
        customFieldValues: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        spaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Space'
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder'
        },
        listId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'List'
        }
    },
    {
        timestamps: true,
    }
);

// Compound index for frequent workspace tasks lookups
taskSchema.index({ workspace: 1, status: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
