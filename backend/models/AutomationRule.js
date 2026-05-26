import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        index: true
    },
    trigger: {
        field: { type: String, required: true }, // e.g. 'priority', 'status', or custom field ID
        operator: { type: String, enum: ['equals'], default: 'equals' },
        value: { type: mongoose.Schema.Types.Mixed, required: true }
    },
    action: {
        type: { type: String, enum: ['assign_user', 'move_status', 'notify', 'notify_admin', 'notify_creator'], required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const AutomationRule = mongoose.model('AutomationRule', automationRuleSchema);

export default AutomationRule;
