import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getOrgName } from '../data/budgetUtils';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">
      <Link
        to="/"
        className="flex items-center hover:text-zinc-900 transition-colors"
      >
        <Home className="w-3 h-3 mr-1" />
        HOME
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        
        // Map common paths to readable names
        let name = value.toUpperCase();
        if (value === 'wps') name = 'WPS BUDGET';
        if (index === 1 && pathnames[0] === 'wps') {
            name = getOrgName(value).toUpperCase();
        }

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            {last ? (
              <span className="text-zinc-900">{name}</span>
            ) : (
              <Link
                to={to}
                className="hover:text-zinc-900 transition-colors"
              >
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
