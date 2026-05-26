import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthGuard from '../features/auth/AuthGuard';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import AcceptInvitePage from '../features/auth/AcceptInvitePage';
import DashboardPage from '../features/dashboard/DashboardPage';
import ProjectsPage from '../features/projects/ProjectsPage';
import ProjectDetailsPage from '../features/projects/ProjectDetailsPage';
import TasksPage from '../features/tasks/TasksPage';
import BookmarksPage from '../features/bookmarks/BookmarksPage';
import ChatPage from '../features/chat/ChatPage';
import AiChatPage from '../features/ai/AiChatPage';
import Analytics from '../pages/Analytics';
import Billing from '../pages/Billing';
import DeveloperKeys from '../pages/DeveloperKeys';
import WorkspaceSettings from '../features/settings/SettingsPage';
import Home from '../pages/Home';
import TimeReportPage from '../pages/TimeReportPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/invite/accept',
        element: <AcceptInvitePage />,
    },
    {
        path: '/dashboard',
        element: (
            <AuthGuard>
                <DashboardLayout />
            </AuthGuard>
        ),
        children: [
            { index: true, element: <DashboardPage /> },
            { path: 'projects', element: <ProjectsPage /> },
            { path: 'projects/:projectId', element: <ProjectDetailsPage /> },
            { path: 'tasks', element: <TasksPage /> },
            { path: 'bookmarks', element: <BookmarksPage /> },
            { path: 'chat', element: <ChatPage /> },
            { path: 'ai', element: <AiChatPage /> },
            { path: 'analytics', element: <Analytics /> },
            { path: 'billing', element: <Billing /> },
            { path: 'developers', element: <DeveloperKeys /> },
            { path: 'settings/:workspaceId', element: <WorkspaceSettings /> },
            { path: 'time-report', element: <TimeReportPage /> },
            {
                path: '*', element: <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
                    <a href="/dashboard" className="px-6 py-3 bg-brand text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                        Return to Dashboard
                    </a>
                </div>
            },
        ],
    },
]);
