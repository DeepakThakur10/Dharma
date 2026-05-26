import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import useWorkspaceStore from '../store/workspaceStore';
import { Layers, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const COLORS = ['#ff6b35', '#ffa07a', '#ffccbc', '#d7ccc8'];

import { useAnalytics } from '../features/analytics/useAnalytics';
import Header from '../components/layout/Header';

export default function Analytics() {
    const { currentWorkspace } = useWorkspaceStore();
    const { data, isLoading, refetch } = useAnalytics(currentWorkspace?._id);

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
        </div>
    );

    const { overview, velocity, timeStats, memberStats } = data || {
        overview: { totalTasks: 0, completed: 0, critical: 0, openTasks: 0 },
        velocity: [],
        timeStats: [],
        memberStats: []
    };

    const fetchAnalytics = () => refetch();

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-page">
            <Header
                title="Workspace Analytics"
                subtitle={`Performance insights for ${currentWorkspace?.name}`}
            />

            <div className="p-6 space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Tasks', value: overview?.totalTasks, icon: Layers, color: 'text-blue-500' },
                        { label: 'Completed', value: overview?.completed, icon: TrendingUp, color: 'text-green-500' },
                        { label: 'Critical Issues', value: overview?.critical, icon: AlertTriangle, color: 'text-red-500' },
                        { label: 'Open Tasks', value: overview?.openTasks, icon: Clock, color: 'text-orange-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card border rounded-xl p-4 shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stat.value || 0}</h2>
                                </div>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Team Velocity */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                            <TrendingUp className="w-5 h-5 text-brand" /> Team Velocity (30d)
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={velocity}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--brand)' }}
                                    />
                                    <Bar dataKey="completedCount" fill="var(--brand)" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Member Distribution */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                            <Layers className="w-5 h-5 text-brand" /> Tasks per Member
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={memberStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {memberStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
