import { useState } from 'react';
import { Users, Send, Crown, Trash2, Loader2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSendInvite, useProjectMembers, useRemoveMember } from './useInvite';
import { useAuthStore } from '../../store/authStore';
import InviteMemberRoleCard from '../../components/enterprise/MemberRoleCard';

export default function InviteMemberModal({ isOpen, onClose, workspaceId, workspaceName }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('employee');
    const [error, setError] = useState('');
    const sendInvite = useSendInvite();
    const removeMember = useRemoveMember();
    const { data: members, isLoading: loadingMembers, error: membersError } = useProjectMembers(isOpen ? workspaceId : null);
    const currentUser = useAuthStore((s) => s.user);

    // Permission check: Can manage members if Lead or Manager
    const userMembership = members?.find(m => m.user?._id === currentUser?._id);
    const canManageMembers = userMembership && (['owner', 'project_lead', 'admin', 'project_manager'].includes(userMembership.role || 'member'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const trimmed = email.trim();
        if (!trimmed) {
            setError('Please enter an email address');
            return;
        }

        try {
            await sendInvite.mutateAsync({ email: trimmed, workspaceId, workspaceName, role });
            setEmail('');
        } catch (err) {
            setError(err.message || 'Failed to send invitation');
        }
    };

    const handleRemove = (member) => {
        const mUser = member.user || {};
        removeMember.mutate({ workspaceId, userId: mUser._id });
    };

    const handleClose = () => {
        setEmail('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Team Members">
            <div className="space-y-5">
                {/* Invite form */}
                {canManageMembers && (
                    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter email address"
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                className="flex-1"
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-brand/20"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text)',
                                    backgroundColor: 'var(--bg-card)'
                                }}
                            >
                                <option value="employee">Employee</option>
                                <option value="project_manager">Manager</option>
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                            </select>
                            <Button type="submit" loading={sendInvite.isPending} size="sm">
                                <Send className="w-3.5 h-3.5" /> Invite
                            </Button>
                        </div>
                        {error && (
                            <p className="text-xs text-red-500 px-1">{error}</p>
                        )}
                        <p className="text-[10px] text-gray-500 px-1 italic">
                            Invitations include the selected role level for this workspace.
                        </p>
                    </form>
                )}

                {/* Members list */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            Active Workspace Team ({members?.length || 0})
                        </p>
                    </div>

                    {loadingMembers ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-brand" />
                        </div>
                    ) : membersError ? (
                        <div className="text-center py-4">
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Failed to load team members.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {members?.map((m) => {
                                const mUser = m.user || {};
                                const isLead = ['owner', 'project_lead'].includes(m.role);
                                return (
                                    <div
                                        key={mUser._id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                                        style={{ backgroundColor: 'var(--bg-card)' }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                            style={{
                                                background: isLead
                                                    ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                                                    : 'linear-gradient(135deg, #ff6b35 0%, #ffa07a 100%)'
                                            }}
                                        >
                                            {mUser.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
                                                    {mUser.name}
                                                    {mUser._id === currentUser?._id && (
                                                        <span className="text-[10px] ml-1.5 font-normal opacity-60">(You)</span>
                                                    )}
                                                </p>
                                                <InviteMemberRoleCard role={m.role} />
                                            </div>
                                            <p className="text-[11px] truncate opacity-60" style={{ color: 'var(--text-muted)' }}>{mUser.email}</p>
                                        </div>
                                        {canManageMembers && mUser._id !== currentUser?._id && !isLead && (
                                            <button
                                                onClick={() => handleRemove(m)}
                                                disabled={removeMember.isPending}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-500 transition-all flex-shrink-0"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {isLead && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                                    </div>
                                );
                            })}
                            {(!members || members.length === 0) && !membersError && (
                                <p className="text-sm text-center py-3" style={{ color: 'var(--text-muted)' }}>
                                    No members data available yet.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
