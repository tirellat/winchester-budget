import { NavLink, Outlet } from 'react-router-dom'
import { Landmark, BarChart3, TrendingUp } from 'lucide-react'

export default function Layout() {
  return (
    <div className="app-layout">
      <nav className="main-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <Landmark size={18} />
            </div>
            <div className="nav-brand-text">
              <span className="nav-brand-title">Winchester Budget</span>
              <span className="nav-brand-subtitle">Transparency Portal</span>
            </div>
          </div>
          <div className="nav-links">
            <NavLink
              to="/summary"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              id="nav-summary"
            >
              <BarChart3 size={16} />
              Summary
            </NavLink>
            <NavLink
              to="/trends"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              id="nav-trends"
            >
              <TrendingUp size={16} />
              Trends
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="footer-inner">
          <span className="footer-text">
            © {new Date().getFullYear()} Town of Winchester. This is not an official site of the Town of Winchester. Transparency Portal.
          </span>
          <div className="footer-links">
            <a href="https://www.winchester.us" className="footer-link" target="_blank" rel="noopener noreferrer">
              Town Website
            </a>
            <a href="https://winchester.us/DocumentCenter/View/12174/FY26YellowSheet_Cerfitied_STM25" className="footer-link" target="_blank" rel="noopener noreferrer">
              Source Data (FY26)
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
