import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    actionType: {
        type: String,
        required: true,
        enum: [
            'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED',
            'STATUS_CHANGED', 'ASSIGNMENT_CHANGED',
            'AUTOMATION_TRIGGERED', 'MEMBER_ADDED',
            'MEMBER_REMOVED', 'WORKSPACE_UPDATED'
        ]
    },
    entityType: {
        type: String,
        required: true,
        enum: ['task', 'workspace', 'member']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Index for fast timeline queries
activityLogSchema.index({ workspaceId: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
