import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getTopNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "text-primary border-b-2 border-primary font-bold pb-1 transition-all"
      : "text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
  }

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "text-primary font-bold py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
      : "text-zinc-600 dark:text-zinc-400 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
  }

  const navLinks = [
    { to: "/summary", label: "Summary" },
    { to: "/wps", label: "WPS Budget" },
    { to: "/trends", label: "Trends" },
    { to: "/raw-data", label: "Raw Data" },
  ]

  return (
    <div className="text-on-background bg-surface min-h-screen flex flex-col">
      {/* Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm dark:shadow-none font-['Public_Sans'] leading-tight tracking-tight">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8 h-full">
            <NavLink to="/" className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-50">
              Winchester Budget
            </NavLink>
            
            <div className="hidden md:flex items-center gap-6 h-full pt-1">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={getTopNavLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 absolute top-16 left-0 w-full z-40 animate-in slide-in-from-top duration-200">
            <div className="px-4 py-2 flex flex-col">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  className={getMobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="uppercase text-xs tracking-widest font-black">{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Canvas */}
      <main className="max-w-7xl mx-auto w-full pt-24 pb-12 px-4 md:px-8 flex-grow">
        <Outlet />
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-16 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 font-['Public_Sans'] text-[10px] uppercase tracking-[0.2em]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="max-w-md">
            <span className="font-black text-zinc-900 dark:text-zinc-50 block mb-4 text-lg tracking-tighter">Winchester Budget</span>
            <p className="text-zinc-500 leading-relaxed mb-6">
              A community-driven fiscal transparency project designed to provide Winchester residents with surgical clarity on municipal spending and education priorities.
            </p>
            <p className="text-zinc-400">© {new Date().getFullYear()} Terence Tirella. This is not an official site of the Town of Winchester.</p>
          </div>
          <div className="flex flex-col md:items-end gap-4">
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <a className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-bold" href="https://www.winchester.us" target="_blank" rel="noreferrer">Official Town Website</a>
              <a className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-bold" href="https://github.com/tirellat/winchester-budget" target="_blank" rel="noreferrer">Open Source Code</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
