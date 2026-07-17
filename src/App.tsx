import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProviders } from '@/providers';
import { AppLayout } from '@/components';
import { 
  Home, 
  Settings,
  Workspace,
  Journal,
  Knowledge
} from '@/pages';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/knowledge" element={<Knowledge />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
