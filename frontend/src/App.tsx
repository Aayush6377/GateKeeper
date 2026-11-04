import './App.css'
import { ToastConfig } from './components/config/ToastConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return <>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppRouter />
      <ToastConfig />
    </AuthProvider>
  </QueryClientProvider>
  </>;
}

export default App
