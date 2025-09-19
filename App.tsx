
import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Orders from './pages/Orders';
import Settlements from './pages/Settlements';
import { useAppData } from './hooks/useAppData';
import type { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const appData = useAppData();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...appData} />;
      case 'clients':
        return <Clients {...appData} />;
      case 'orders':
        return <Orders {...appData} />;
      case 'settlements':
        return <Settlements {...appData} />;
      default:
        return <Dashboard {...appData} />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;