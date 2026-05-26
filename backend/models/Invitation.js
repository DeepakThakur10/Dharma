import mongoose from 'mongoose';

const invitationSchema = mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        workspaceName: {
            type: String,
            required: true,
        },
        invitedEmail: {
            type: String,
            required: true,
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        inviterName: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending',
        },
        role: {
            type: String,
            enum: ['admin', 'member', 'guest', 'project_lead', 'project_manager', 'employee'],
            default: 'member'
        }
    },
    {
        timestamps: true,
    }
);

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
