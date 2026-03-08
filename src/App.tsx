import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { CalculatorWizard } from './pages/CalculatorWizard';
import { CalculationsList } from './pages/CalculationsList';
import { CalculationDetail } from './pages/CalculationDetail';
import { CatalogManager } from './pages/CatalogManager';
import { CompanySettings } from './pages/CompanySettings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/calculator" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/calculator" element={<CalculatorWizard />} />
          <Route path="/calculations" element={<CalculationsList />} />
          <Route path="/calculations/:id" element={<CalculationDetail />} />

          <Route
            path="/catalog"
            element={
              <AdminRoute>
                <CatalogManager />
              </AdminRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminRoute>
                <CompanySettings />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/calculator" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
