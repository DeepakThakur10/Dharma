import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'number', 'select', 'date', 'boolean'],
        required: true
    },
    options: [String], // only for select
    isRequired: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Ensure unique field names within a workspace
customFieldSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

const CustomField = mongoose.model('CustomField', customFieldSchema);

export default CustomField;
