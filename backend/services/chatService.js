import ProjectMessage from '../models/ProjectMessage.js';
import Workspace from '../models/Workspace.js';

export const getWorkspaceMessages = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const isMember = workspace.members.some(m => m.user.toString() === userId.toString());
    if (!isMember && workspace.owner.toString() !== userId.toString()) {
        throw new Error('Not authorized to view this chat');
    }

    return await ProjectMessage.find({ workspace: workspaceId })
        .sort({ createdAt: 1 })
        .limit(100);
};

export const sendMessage = async (workspaceId, userId, userName, text) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    return await ProjectMessage.create({
        workspace: workspaceId,
        sender: userId,
        senderName: userName,
        text
    });
};
