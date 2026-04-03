import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  const getTopNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "text-primary border-b-2 border-primary font-bold pb-1 active:scale-95 duration-200 transition-all"
      : "text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors active:scale-95 duration-200"
  }

  const getSideNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "flex items-center gap-3 p-3 text-primary bg-white dark:bg-zinc-950 border-r-4 border-primary font-bold hover:pl-4 transition-all duration-300 cursor-pointer"
      : "flex items-center gap-3 p-3 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:pl-4 transition-all duration-300 cursor-pointer"
  }

  return (
    <div className="text-on-background bg-surface min-h-screen flex flex-col">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm dark:shadow-none flex justify-between items-center px-8 h-16 max-w-full font-['Public_Sans'] leading-tight tracking-tight">
        <div className="flex items-center gap-8 h-full">
          <span className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">Winchester Budget</span>
          <div className="hidden md:flex items-center gap-6 h-full pt-1">
            <NavLink to="/summary" className={getTopNavLinkClass} id="nav-summary">
              Summary
            </NavLink>
            <NavLink to="/wps" className={getTopNavLinkClass} id="nav-wps">
              WPS Budget
            </NavLink>
            <NavLink to="/trends" className={getTopNavLinkClass} id="nav-trends">
              Trends
            </NavLink>
            <NavLink to="/raw-data" className={getTopNavLinkClass} id="nav-raw-data">
              Raw Data
            </NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://winchester.us/DocumentCenter/View/12174/FY26YellowSheet_Cerfitied_STM25" target="_blank" rel="noreferrer">
            <button className="bg-primary text-on-primary px-4 py-2 text-sm font-bold active:scale-95 duration-200 transition-all">
              Source Data
            </button>
          </a>
        </div>
      </nav>

      {/* Side Navigation Shell */}
      <aside className="h-screen w-64 fixed left-0 top-0 pt-20 bg-zinc-50 dark:bg-zinc-900 flex-col gap-2 p-4 hidden lg:flex border-r border-zinc-200 dark:border-zinc-800">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50 leading-tight">Winchester Budget</h2>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/summary" className={getSideNavLinkClass}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium text-sm">Overview</span>
          </NavLink>
          <NavLink to="/wps" className={getSideNavLinkClass}>
            <span className="material-symbols-outlined">account_tree</span>
            <span className="font-medium text-sm">WPS Budget</span>
          </NavLink>
          <NavLink to="/trends" className={getSideNavLinkClass}>
            <span className="material-symbols-outlined">trending_up</span>
            <span className="font-medium text-sm">Trends Analysis</span>
          </NavLink>
          <NavLink to="/raw-data" className={getSideNavLinkClass}>
            <span className="material-symbols-outlined">table_view</span>
            <span className="font-medium text-sm">Raw Data</span>
          </NavLink>
        </nav>
        <div className="mt-auto p-2 text-xs text-zinc-500">
          Terence Tirella © {new Date().getFullYear()}
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="lg:ml-64 pt-24 pb-12 px-4 md:px-8 flex-grow">
        <Outlet />
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-12 px-8 mt-auto bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-['Public_Sans'] text-xs uppercase tracking-widest lg:pl-[18rem]">
        <div>
          <span className="font-bold text-zinc-900 dark:text-zinc-50 block mb-2">Winchester Budget</span>
          <p className="text-zinc-500 opacity-80 leading-relaxed">© {new Date().getFullYear()} Terence Tirella. This is not an official site of the Town of Winchester.</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end">
          <a className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="https://www.winchester.us" target="_blank" rel="noreferrer">Town Website</a>
        </div>
      </footer>
    </div>
  )
}
