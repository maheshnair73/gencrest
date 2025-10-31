import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FieldVisits from './pages/FieldVisits';
import SalesOrders from './pages/SalesOrders';
import Liquidation from './pages/Liquidation';
import Contacts from './pages/Contacts';
import { Planning } from './pages/Planning';
import TravelReimbursement from './pages/TravelReimbursement';
import TravelClaimApprovals from './pages/TravelClaimApprovals';
import ActivityReimbursement from './pages/ActivityReimbursement';
import Performance from './pages/Performance';
import RetailerLiquidation from './pages/RetailerLiquidation';
import RetailerInventory from './pages/RetailerInventory';
import RetailerStockVerification from './pages/RetailerStockVerification';
import MobileAppDesign from './pages/MobileAppDesign';
import MobileAppPage from './pages/MobileAppPage';
import MDOModule from './pages/MDOModule';
import UserManagement from './pages/UserManagement';
import Approvals from './pages/Approvals';
import DistributorDetails from './pages/DistributorDetails';
import BusinessLogic from './pages/BusinessLogic';
import Reports from './pages/Reports';
import TestPage from './pages/TestPage';
import PaginatedExample from './pages/PaginatedExample';
import WorkPlan from './pages/WorkPlan';
import WorkPlanManagement from './pages/WorkPlanManagement';
import SupportTickets from './pages/SupportTickets';
import Profile from './pages/Profile';
import ActivityTracker from './pages/ActivityTracker';
import Notifications from './pages/Notifications';
import { TechnicalDocumentation } from './pages/TechnicalDocumentation';

function App() {
  console.log('=== App component rendering ===');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  console.log('Auth status:', isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tech-docs" element={<TechnicalDocumentation />} />
        <Route path="/field-visits" element={<FieldVisits />} />
        <Route path="/sales-orders" element={<SalesOrders />} />
        <Route path="/liquidation" element={<Liquidation />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/travel" element={<TravelReimbursement />} />
        <Route path="/travel-approvals" element={<TravelClaimApprovals />} />
        <Route path="/activity-reimbursement" element={<ActivityReimbursement />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/retailer-liquidation/:id" element={<RetailerLiquidation />} />
        <Route path="/retailer-inventory" element={<RetailerInventory />} />
        <Route path="/retailer-stock-verification" element={<RetailerStockVerification />} />
        <Route path="/mobile-design" element={<MobileAppDesign />} />
        <Route path="/mobile" element={<MobileAppPage />} />
        <Route path="/mdo-module" element={<MDOModule />} />
        <Route path="/activity-tracker" element={<ActivityTracker />} />
        <Route path="/activity-tracker/past-tasks" element={<ActivityTracker />} />
        <Route path="/activity-tracker/my-activity" element={<ActivityTracker />} />
        <Route path="/activity-tracker/team-activity" element={<ActivityTracker />} />
        <Route path="/activity-tracker/work-plans" element={<ActivityTracker />} />
        <Route path="/activity-tracker/work-plan/:id" element={<ActivityTracker />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/distributor/:id" element={<DistributorDetails />} />
        <Route path="/business-logic" element={<BusinessLogic />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/pagination-example" element={<PaginatedExample />} />
        <Route path="/work-plan" element={<WorkPlan />} />
        <Route path="/work-plan-management" element={<WorkPlanManagement />} />
        <Route path="/support-tickets" element={<SupportTickets />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Layout>
  );
}

export default App;