import mongoose from 'mongoose';

const projectMessageSchema = mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const ProjectMessage = mongoose.model('ProjectMessage', projectMessageSchema);

export default ProjectMessage;
