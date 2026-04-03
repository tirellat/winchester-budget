import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown } from 'lucide-react';

import Breadcrumbs from '../components/Breadcrumbs';
import {
  getBudgetSummary,
  getOrgDetails,
  getOrgName,
  formatCurrency,
  parseCurrency,
  type DetailedBudgetSummary,
  type DetailedBudgetItem
} from '../data/budgetUtils';

const COLORS = [
  '#9e001f', '#00346f', '#48626e', '#5c8a5c', '#691700', 
  '#7b5ea7', '#2e7d32', '#546E7A', '#d32f2f', '#1976d2'
];

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function DetailedBudgetPage() {
  const { orgId } = useParams<{ orgId?: string }>();
  const navigate = useNavigate();
  const summary = getBudgetSummary();
  const isDrilledDown = !!orgId;
  
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const orgName = useMemo(() => orgId ? getOrgName(orgId) : 'WPS District Summary', [orgId]);
  const details = useMemo(() => orgId ? getOrgDetails(orgId) : [], [orgId]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSummary = useMemo(() => {
    const items = summary.filter(s => s["Cost Center (Org)"] !== "TOTAL OPERATING");
    if (!sortConfig) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof DetailedBudgetSummary];
      const bValue = b[sortConfig.key as keyof DetailedBudgetSummary];
      
      let aNum = parseCurrency(aValue);
      let bNum = parseCurrency(bValue);

      if (sortConfig.key === "% Change FY25 VS FY26 Budget") {
        aNum = parseFloat(aValue.replace('%', ''));
        bNum = parseFloat(bValue.replace('%', ''));
      }

      if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [summary, sortConfig]);

  const sortedDetails = useMemo(() => {
    if (!sortConfig) return details;

    return [...details].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof DetailedBudgetItem];
      const bValue = b[sortConfig.key as keyof DetailedBudgetItem];
      
      let aNum = parseCurrency(aValue);
      let bNum = parseCurrency(bValue);

      if (sortConfig.key === "Account Description" || sortConfig.key === "OBJ") {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [details, sortConfig]);

  // Level 1: District Summary Data
  const districtPieData = useMemo(() => {
    return summary
      .filter(s => s["Cost Center (Org)"] !== "TOTAL OPERATING")
      .map((s, i) => ({
        name: s["Cost Center (Org)"].split(' (')[0],
        value: parseCurrency(s["FY26 Proposed Total Spending"]),
        id: s["Cost Center (Org)"].match(/\((\d+)\)/)?.[1] || '',
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  const districtBarData = useMemo(() => {
    return summary
      .filter(s => s["Cost Center (Org)"] !== "TOTAL OPERATING")
      .map(s => {
        const pct = parseFloat(s["% Change FY25 VS FY26 Budget"].replace('%', ''));
        return {
          name: s["Cost Center (Org)"].split(' (')[0],
          shortName: s["Cost Center (Org)"].split(' (')[0].substring(0, 10),
          change: pct,
          id: s["Cost Center (Org)"].match(/\((\d+)\)/)?.[1] || ''
        };
      })
      .sort((a, b) => b.change - a.change);
  }, [summary]);

  // Level 2: Org Detail Data
  const orgPieData = useMemo(() => {
    if (!isDrilledDown || !orgId) return [];
    const orgSummary = summary.find(s => s["Cost Center (Org)"].includes(`(${orgId})`));
    if (!orgSummary) return [];

    return [
      { name: 'Personnel Services', value: parseCurrency(orgSummary["FY26 Proposed Personnel Services"]), color: '#9e001f' },
      { name: 'Other Expenses', value: parseCurrency(orgSummary["FY26 Proposed Other Expenses"]), color: '#00346f' }
    ].filter(d => d.value > 0);
  }, [isDrilledDown, orgId, summary]);

  const orgBarData = useMemo(() => {
    if (!isDrilledDown || !details.length) return [];
    // Show top 8 line items by FY26 budget
    return details
      .map(d => ({
        name: d["Account Description"],
        shortName: d["Account Description"].substring(0, 15),
        current: parseCurrency(d["FY26 Recommended Budget ($)"]),
        previous: parseCurrency(d["FY25 Budget ($)"])
      }))
      .sort((a, b) => b.current - a.current)
      .slice(0, 8);
  }, [isDrilledDown, details]);

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <Minus className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumbs />
      
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          {isDrilledDown && (
            <Link to="/detailed" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="w-6 h-6 text-primary" />
            </Link>
          )}
          <div>
            <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-1">
              FY26 WPS (Schools) Budget Analysis
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-on-background tracking-tighter leading-none">
              WPS: {orgName}
            </h1>
          </div>
        </div>
        <p className="text-secondary text-lg max-w-3xl leading-relaxed">
          {isDrilledDown 
            ? `Detailed breakdown of proposed expenditures and personnel for the WPS ${orgName} cost center, contrasting recommended allocations against historical performance.`
            : "Strategic overview of the FY26 Winchester Public Schools (WPS) budget proposal, providing a high-level summary of all cost centers."}
        </p>
      </header>

      {/* Visualizations Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Card: Composition */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col min-h-[450px]">
          <h2 className="text-xl font-black tracking-tight mb-2 text-on-background">
            {isDrilledDown ? 'Expenditure Composition' : 'Budget Allocation by Org'}
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-6">
            Proportional Distribution
          </p>
          
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={isDrilledDown ? orgPieData : districtPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {(isDrilledDown ? orgPieData : districtPieData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-4 shadow-xl border border-zinc-200 dark:border-zinc-700 text-sm">
                        <div className="font-black text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-tight">{data.name}</div>
                        <div className="text-primary font-bold text-lg">{formatCurrency(data.value)}</div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {(isDrilledDown ? orgPieData : districtPieData.slice(0, 6)).map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary truncate">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Performance/Comparison */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col min-h-[450px]">
          <h2 className="text-xl font-black tracking-tight mb-2 text-on-background">
            {isDrilledDown ? 'Top Line Item Comparison' : 'Budget Velocity by Org'}
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-6">
            {isDrilledDown ? 'FY25 vs FY26 Comparison' : '% Change from FY25'}
          </p>

          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              {isDrilledDown ? (
                <BarChart data={orgBarData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="shortName" 
                    type="category" 
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#71717a' }}
                    width={100}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white dark:bg-zinc-800 p-4 shadow-xl border border-zinc-200 dark:border-zinc-700 text-sm">
                          <div className="font-black text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-tight">{payload[0].payload.name}</div>
                          {payload.map((p, i) => (
                            <div key={i} className="flex justify-between gap-8 mb-1">
                              <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">{p.name === 'current' ? 'FY26' : 'FY25'}</span>
                              <span className="font-black text-zinc-900 dark:text-zinc-100">{formatCurrency(p.value as number)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="previous" name="previous" fill="#e4e4e7" barSize={12} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="current" name="current" fill="#9e001f" barSize={12} radius={[0, 2, 2, 0]} />
                </BarChart>
              ) : (
                <BarChart data={districtBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-zinc-800 p-4 shadow-xl border border-zinc-200 dark:border-zinc-700 text-sm text-center">
                          <div className="font-black text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-tight">{data.name}</div>
                          <div className={`text-lg font-black ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.change > 0 ? '+' : ''}{data.change}%
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar 
                    dataKey="change" 
                    fill="#9e001f" 
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  >
                    {districtBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#9e001f' : '#00346f'} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {isDrilledDown ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-primary" /> FY26 PROPOSED</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-zinc-200" /> FY25 BUDGET</div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-primary" /> INCREASE</div>
                <div className="flex items-center gap-1.5"><TrendingDown className="w-3 h-3 text-[#00346f]" /> DECREASE</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_rgba(26,28,28,0.06)] mb-20 overflow-hidden">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-on-background">
              {isDrilledDown ? 'Account Detail Ledger' : 'Organizational Budget Summary'}
            </h2>
            <p className="text-sm text-secondary">
              {isDrilledDown ? `Detailed line-item breakdown for ORG ${orgId}.` : 'Click on any department to view detailed account-level expenditures.'}
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Certified FY26 Proposal</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                {isDrilledDown ? (
                  <>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('Account Description')}>
                      <div className="flex items-center gap-2">Account Description <SortIcon column="Account Description" /></div>
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('FY24 Actuals')}>
                      <div className="flex items-center justify-end gap-2">FY24 Actual <SortIcon column="FY24 Actuals" /></div>
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('FY25 Budget ($)')}>
                      <div className="flex items-center justify-end gap-2">FY25 Budget <SortIcon column="FY25 Budget ($)" /></div>
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-primary text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('FY26 Recommended Budget ($)')}>
                      <div className="flex items-center justify-end gap-2">FY26 Rec <SortIcon column="FY26 Recommended Budget ($)" /></div>
                    </th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('Change ($)')}>
                      <div className="flex items-center justify-end gap-2">Change <SortIcon column="Change ($)" /></div>
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('Cost Center (Org)')}>
                      <div className="flex items-center gap-2">Cost Center <SortIcon column="Cost Center (Org)" /></div>
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('FY26 Proposed Personnel Services')}>
                      <div className="flex items-center justify-end gap-2">Personnel <SortIcon column="FY26 Proposed Personnel Services" /></div>
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('FY26 Proposed Other Expenses')}>
                      <div className="flex items-center justify-end gap-2">Expenses <SortIcon column="FY26 Proposed Other Expenses" /></div>
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-primary font-black text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('FY26 Proposed Total Spending')}>
                      <div className="flex items-center justify-end gap-2">FY26 Total <SortIcon column="FY26 Proposed Total Spending" /></div>
                    </th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => handleSort('% Change FY25 VS FY26 Budget')}>
                      <div className="flex items-center justify-end gap-2">Growth <SortIcon column="% Change FY25 VS FY26 Budget" /></div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isDrilledDown ? (
                sortedDetails.map((item, idx) => {
                  const change = parseCurrency(item["Change ($)"]);
                  return (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="text-sm font-black text-on-background group-hover:text-primary transition-colors">{item["Account Description"]}</div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">OBJ {item.OBJ}</div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-zinc-500 text-right">{formatCurrency(parseCurrency(item["FY24 Actuals"]))}</td>
                      <td className="px-4 py-4 text-sm font-medium text-zinc-500 text-right">{formatCurrency(parseCurrency(item["FY25 Budget ($)"]))}</td>
                      <td className="px-4 py-4 text-sm font-black text-on-background text-right">{formatCurrency(parseCurrency(item["FY26 Recommended Budget ($)"]))}</td>
                      <td className="px-8 py-4 text-right">
                        <div className={`text-xs font-black flex items-center justify-end gap-1 ${change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-zinc-400'}`}>
                          {change > 0 ? <TrendingUp className="w-3 h-3" /> : change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {formatCurrency(change)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                sortedSummary.map((s, idx) => {
                  const id = s["Cost Center (Org)"].match(/\((\d+)\)/)?.[1];
                  const growth = parseFloat(s["% Change FY25 VS FY26 Budget"].replace('%', ''));
                  return (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => navigate(`/detailed/${id}`)}>
                      <td className="px-8 py-5">
                        <Link to={`/detailed/${id}`} className="text-base font-black text-on-background group-hover:text-primary transition-colors flex items-center gap-2">
                          {s["Cost Center (Org)"].split(' (')[0]}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.1em]">ORG {id} • {s["FY26 Proposed FTE"]} FTE</div>
                      </td>
                      <td className="px-4 py-5 text-sm font-medium text-zinc-500 text-right">{formatCurrency(parseCurrency(s["FY26 Proposed Personnel Services"]))}</td>
                      <td className="px-4 py-5 text-sm font-medium text-zinc-500 text-right">{formatCurrency(parseCurrency(s["FY26 Proposed Other Expenses"]))}</td>
                      <td className="px-4 py-5 text-base font-black text-on-background text-right">{formatCurrency(parseCurrency(s["FY26 Proposed Total Spending"]))}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`inline-block px-2 py-1 text-[10px] font-black rounded-full ${growth > 5 ? 'bg-red-50 text-red-700' : growth > 0 ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                          {s["% Change FY25 VS FY26 Budget"]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
