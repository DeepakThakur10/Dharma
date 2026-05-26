import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: false,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    feature: {
        type: String,
        enum: ['chat', 'breakdown', 'risk-analysis', 'autocomplete'],
        required: true
    },
    tokensUsed: {
        type: Number,
        default: 0
    },
    prompt: String,
    response: String,
    status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success'
    }
}, { timestamps: true });

// Index for usage reporting by workspace and month
aiUsageSchema.index({ workspace: 1, createdAt: 1 });

const AiUsage = mongoose.model('AiUsage', aiUsageSchema);

export default AiUsage;
