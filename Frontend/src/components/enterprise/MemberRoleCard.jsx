import { cn } from '../../lib/utils';
import { Shield, User, Star, Briefcase } from 'lucide-react';

const roleConfig = {
    project_lead: {
        label: 'Project Lead',
        color: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900',
        icon: Star
    },
    project_manager: {
        label: 'Project Manager',
        color: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900',
        icon: Shield
    },
    employee: {
        label: 'Employee',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900',
        icon: Briefcase
    },
    member: {
        label: 'Member',
        color: 'text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-900',
        icon: User
    },
    owner: {
        label: 'Owner',
        color: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900',
        icon: Star
    },
    admin: {
        label: 'Admin',
        color: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900',
        icon: Shield
    }
};

export default function MemberRoleCard({ role, className }) {
    const config = roleConfig[role] || roleConfig.member;
    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
            config.color,
            className
        )}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}
