import Invitation from '../models/Invitation.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { sendInviteEmail } from '../config/mailer.js';
import { logActivity } from './activityService.js';

export const createInvite = async (inviteData, inviter) => {
    const { email, workspaceId, workspaceName, role = 'member' } = inviteData;

    if (inviter.email === email) {
        throw new Error("You can't invite yourself");
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const inviterMembership = workspace.members.find(m => m.user.toString() === inviter._id.toString());
    if (!inviterMembership) throw new Error('You are not a member of this workspace');

    // Simple role check
    const ROLE_LEVELS = { guest: 1, member: 2, employee: 2, admin: 3, project_manager: 3, owner: 4, project_lead: 4 };
    const inviterLevel = ROLE_LEVELS[inviterMembership.role] || 1;
    if (inviterLevel < 3) throw new Error('Only Project Managers or Leads can invite members');

    const existingInvite = await Invitation.findOne({
        invitedEmail: email,
        workspace: workspaceId,
        status: 'pending'
    });
    if (existingInvite) throw new Error('Invitation already pending for this email');

    const invitedUser = await User.findOne({ email });
    if (invitedUser && workspace.members.some(m => m.user.toString() === invitedUser._id.toString())) {
        throw new Error('User is already a member of this workspace');
    }

    const invitation = await Invitation.create({
        workspace: workspaceId,
        workspaceName,
        invitedEmail: email,
        invitedBy: inviter._id,
        inviterName: inviter.name || inviter.email,
        status: 'pending',
        role
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const acceptUrl = `${frontendUrl}/invite/accept?id=${invitation._id}`;

    await sendInviteEmail(email, inviter.name || inviter.email, workspaceName, acceptUrl);

    await logActivity({
        workspaceId,
        userId: inviter._id,
        actionType: 'MEMBER_INVITED',
        entityType: 'user',
        entityId: invitation._id,
        metadata: { invitedEmail: email, role }
    });

    return invitation;
};

export const acceptInvite = async (invitationId, user) => {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) throw new Error('Invitation not found');
    if (invitation.invitedEmail !== user.email) throw new Error('This invitation is not for your email');
    if (invitation.status !== 'pending') throw new Error(`Invitation already ${invitation.status}`);

    const workspace = await Workspace.findById(invitation.workspace);
    if (!workspace) throw new Error('Workspace not found');

    const isAlreadyMember = workspace.members.some(m => m.user.toString() === user._id.toString());
    if (!isAlreadyMember) {
        workspace.members.push({ user: user._id, role: invitation.role || 'member' });
        await workspace.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    await logActivity({
        workspaceId: workspace._id,
        userId: user._id,
        actionType: 'MEMBER_ADDED',
        entityType: 'user',
        entityId: user._id,
        metadata: { role: invitation.role }
    });

    return workspace._id;
};
