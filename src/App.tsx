import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProviders } from '@/providers';
import { AppLayout } from '@/components';
import { 
  Home, 
  Experiment, 
  Lab, 
  Observations, 
  Explain, 
  Notebook, 
  Settings,
  Workspace,
  Discovery
} from '@/pages';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experiment" element={<Experiment />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/observations" element={<Observations />} />
            <Route path="/explain" element={<Explain />} />
            <Route path="/notebook" element={<Notebook />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/discovery" element={<Discovery />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
