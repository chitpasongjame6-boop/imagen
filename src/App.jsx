import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SimList from './pages/SimList'
import SimDetail from './pages/SimDetail'
import SimForm from './pages/SimForm'
import AgentList from './pages/AgentList'
import AgentDetail from './pages/AgentDetail'
import AgentForm from './pages/AgentForm'
import TransactionList from './pages/TransactionList'
import TransactionForm from './pages/TransactionForm'
import Reports from './pages/Reports'
import StaffList from './pages/StaffList'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  const { loading } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
    </div>
  )
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />

                <Route path="/sims" element={<SimList />} />
                <Route path="/sims/new" element={<SimForm />} />
                <Route path="/sims/:id" element={<SimDetail />} />
                <Route path="/sims/:id/edit" element={<SimForm />} />

                <Route path="/agents" element={<AgentList />} />
                <Route path="/agents/new" element={<AgentForm />} />
                <Route path="/agents/:id" element={<AgentDetail />} />
                <Route path="/agents/:id/edit" element={<AgentForm />} />

                <Route path="/transactions" element={<TransactionList />} />
                <Route path="/transactions/new" element={<TransactionForm />} />
                <Route path="/transactions/:id" element={<TransactionForm />} />

                <Route path="/reports" element={<Reports />} />
                <Route path="/staff" element={<StaffList />} />

                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </AppProvider>
  )
}
