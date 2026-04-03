import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import SummaryPage from './pages/SummaryPage'
import TrendsPage from './pages/TrendsPage'
import RawDataPage from './pages/RawDataPage'
import DetailedBudgetPage from './pages/DetailedBudgetPage'
import './firebase'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/summary" replace />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/detailed/:orgId?" element={<DetailedBudgetPage />} />
          <Route path="/raw-data" element={<RawDataPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
