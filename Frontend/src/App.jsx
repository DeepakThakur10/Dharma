import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { useAuth } from './features/auth/useAuth';
import { useUIStore } from './store/uiStore';

export default function App() {
  const { loading } = useAuth();
  const initDarkMode = useUIStore((s) => s.initDarkMode);

  // Sync dark mode class on initial load
  useEffect(() => {
    initDarkMode();
  }, [initDarkMode]);

  return <RouterProvider router={router} />;
}