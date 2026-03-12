import React from 'react';
import ReactDOM from 'react-dom/client';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js';
import '../node_modules/bootstrap-icons/font/bootstrap-icons.min.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Flip, ToastContainer } from 'react-toastify';
import App from './components/App';
import SuperAdminApp from './components/SuperAdminApp';
import AdminApp from './components/AdminApp';
import ResidentApp from './components/ResidentApp';
import Login from './components/auth/Login';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ResidentDashboard from './components/resident/ResidentDashboard';
import ManageSocieties from './components/superadmin/ManageSocieties';
import ManageBuildings from './components/admin/ManageBuildings';
import ManageFlats from './components/admin/ManageFlats';
import ManageResidents from './components/admin/ManageResidents';
import ManageRates from './components/admin/ManageRates';
import ManageBills from './components/admin/ManageBills';
import ManageComplaints from './components/admin/ManageComplaints';
import ManageNotices from './components/admin/ManageNotices';
import ManageAdmins from './components/superadmin/ManageAdmins';
import MyBills from './components/resident/MyBills';
import MyPayments from './components/resident/MyPayments';
import MyComplaints from './components/resident/MyComplaints';
import MyNotices from './components/resident/MyNotices';
import './index.css';

let myRoutes = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ]
  },
  {
    path: '/superadmin',
    element: <SuperAdminApp />,
    children: [
      {
        index: true,
        element: <Navigate to="/superadmin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <SuperAdminDashboard />,
      },
      {
        path: "societies",
        element: <ManageSocieties />,
      },
      {
        path: "admins",
        element: <ManageAdmins />,
      },
    ]
  },
  {
    path: '/admin',
    element: <AdminApp />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <AdminDashboard />
      },
      {
        path: "buildings",
        element: <ManageBuildings />
      },
      {
        path: "flats",
        element: <ManageFlats />
      },
      {
        path: "residents",
        element: <ManageResidents />
      },
      {
        path: "maintenance",
        element: <ManageRates />
      },
      {
        path: "bills",
        element: <ManageBills />
      },
      {
        path: "complaints",
        element: <ManageComplaints />
      },
      {
        path: "notices",
        element: <ManageNotices />
      },
    ]
  }, ,
  {
    path: '/resident',
    element: <ResidentApp />,
    children: [
      {
        index: true,
        element: <Navigate to="/resident/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <ResidentDashboard />
      },
      {
        path: "bills",
        element: <MyBills />
      },
      {
        path: "payments",
        element: <MyPayments />
      },
      {
        path: "complaints",
        element: <MyComplaints />
      },
      {
        path: "notices",
        element: <MyNotices />
      },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <RouterProvider router={myRoutes} />
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Flip}
    />
  </>
);