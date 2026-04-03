import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

import {
  getBudgetData,
  getLatestCompleteFY,
  getTotalBudget,
  getTotalMunicipal,
  formatCurrency,
  formatPercent,
  getFiscalYearLabel,
} from '../data/budgetUtils'

const CATEGORY_COLORS: Record<string, string> = {
  education: '#00346f',
  municipal: '#48626e',
  dpw: '#5c8a5c',
  publicSafety: '#691700',
  healthSocialServices: '#7b5ea7',
  cultureRecreation: '#2e7d32',
  generalGovernment: '#546E7A',
}

const CATEGORY_LABELS: Record<string, string> = {
  education: 'Education (WPS)',
  municipal: 'Municipal Services',
  dpw: 'Dept. of Public Works',
  publicSafety: 'Public Safety',
  healthSocialServices: 'Health & Social Services',
  cultureRecreation: 'Culture & Recreation',
  generalGovernment: 'General Government',
}

export default function SummaryPage() {
  const data = getBudgetData()
  const completeFYs = data.fiscalYears.filter(fy => fy.municipal !== null)
  
  const defaultFY = getLatestCompleteFY()
  const [selectedFYStr, setSelectedFYStr] = useState(defaultFY.fiscalYear)
  
  const latestFY = useMemo(() => 
    completeFYs.find(fy => fy.fiscalYear === selectedFYStr) || defaultFY,
  [selectedFYStr, completeFYs, defaultFY])
  
  const totalBudget = getTotalBudget(latestFY)!
  const totalMunicipal = getTotalMunicipal(latestFY)!
  const educationPct = ((latestFY.education / totalBudget) * 100).toFixed(1)

  // Previous FY for comparison
  const latestIndex = completeFYs.findIndex(fy => fy.fiscalYear === latestFY.fiscalYear)
  const prevFY = latestIndex > 0 ? completeFYs[latestIndex - 1] : completeFYs[latestIndex]
  const prevTotal = getTotalBudget(prevFY)!
  const totalGrowth = prevTotal ? ((totalBudget - prevTotal) / prevTotal * 100).toFixed(2) : "0.00"

  // Pie chart data
  const pieData = useMemo(() => [
    { name: 'Education', value: latestFY.education, color: CATEGORY_COLORS.education },
    { name: 'Municipal', value: latestFY.municipal!, color: CATEGORY_COLORS.municipal },
    { name: 'DPW', value: latestFY.dpw!, color: CATEGORY_COLORS.dpw },
    { name: 'Public Safety', value: latestFY.publicSafety!, color: CATEGORY_COLORS.publicSafety },
    { name: 'Health & Social', value: latestFY.healthSocialServices!, color: CATEGORY_COLORS.healthSocialServices },
    { name: 'Culture & Rec', value: latestFY.cultureRecreation!, color: CATEGORY_COLORS.cultureRecreation },
    { name: 'General Gov', value: latestFY.generalGovernment!, color: CATEGORY_COLORS.generalGovernment },
  ], [latestFY])

  // Bar chart: budget vs actual (simulated with approved)
  const barData = useMemo(() => {
    const categories = ['education', 'municipal', 'dpw', 'publicSafety', 'healthSocialServices', 'cultureRecreation', 'generalGovernment'] as const
    return categories.map(cat => ({
      name: CATEGORY_LABELS[cat].replace(/\(.*\)/, '').trim(),
      shortName: cat === 'healthSocialServices' ? 'Health' : 
                 cat === 'cultureRecreation' ? 'Culture' :
                 cat === 'generalGovernment' ? 'General' :
                 cat === 'publicSafety' ? 'Safety' :
                 cat === 'education' ? 'Education' :
                 cat === 'municipal' ? 'Municipal' : 'DPW',
      approved: latestFY[cat] as number,
      previous: prevFY[cat] as number,
    }))
  }, [latestFY, prevFY])


  return (
    <>
      <header className="mb-12 max-w-5xl flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-3">Fiscal Year {getFiscalYearLabel(latestFY.fiscalYear).replace('FY', '')} Performance</p>
          <h1 className="text-5xl md:text-6xl font-black text-on-background tracking-tighter leading-none mb-6">Winchester Budget Summary</h1>
          <p className="text-secondary text-lg max-w-2xl leading-relaxed">A high-level synthesis of municipal fiscal health, contrasting projected revenues against essential expenditures with surgical precision.</p>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-48">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Select Fiscal Year</label>
          <select 
            className="bg-surface-container border border-outline dark:bg-zinc-800 dark:border-zinc-700 text-on-surface p-2 rounded-md font-medium outline-none focus:ring-2 focus:ring-primary/50"
            value={selectedFYStr}
            onChange={(e) => setSelectedFYStr(e.target.value)}
          >
            {[...completeFYs].reverse().map(fy => (
              <option key={fy.fiscalYear} value={fy.fiscalYear}>{getFiscalYearLabel(fy.fiscalYear)}</option>
            ))}
          </select>
        </div>
      </header>

      {/* KPI Grid: Tonal Layering */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-surface-container-lowest p-8 shadow-[0_20px_40px_rgba(26,28,28,0.06)] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Total Budget</p>
            <span className="bg-success/10 text-success px-2 py-1 text-[10px] font-bold rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> +{totalGrowth}%
            </span>
          </div>
          <h3 className="text-4xl font-black tracking-tight text-on-background mb-2">{formatCurrency(totalBudget, true)}</h3>
          <p className="text-xs text-secondary">vs {getFiscalYearLabel(prevFY.fiscalYear)}</p>
        </div>

        <div className="bg-surface-container-lowest p-8 shadow-[0_20px_40px_rgba(26,28,28,0.06)] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Education (WPS)</p>
            <span className={latestFY.percentChange.education! > 5 ? "bg-error/10 text-error px-2 py-1 text-[10px] font-bold rounded-full flex items-center gap-1" : "bg-success/10 text-success px-2 py-1 text-[10px] font-bold rounded-full flex items-center gap-1"}>
              <span className="material-symbols-outlined text-xs">{latestFY.percentChange.education! > 5 ? "trending_up" : "check_circle"}</span> {formatPercent(latestFY.percentChange.education)}
            </span>
          </div>
          <h3 className="text-4xl font-black tracking-tight text-on-background mb-2">{formatCurrency(latestFY.education, true)}</h3>
          <p className="text-xs text-secondary">{educationPct}% of total budget</p>
        </div>

        <div className="bg-surface-container-lowest p-8 shadow-[0_20px_40px_rgba(26,28,28,0.06)] border-t-4 border-primary dark:bg-zinc-900">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Municipal Operations</p>
            <span className="bg-success/10 text-success px-2 py-1 text-[10px] font-bold rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> {formatPercent(latestFY.percentChange.municipal)}
            </span>
          </div>
          <h3 className="text-4xl font-black tracking-tight text-on-background mb-2">{formatCurrency(totalMunicipal, true)}</h3>
          <p className="text-xs text-secondary">All non-education departments</p>
        </div>
      </section>

      {/* Asymmetric Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Expenditure Split (Bento Card Style) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-surface-container-low p-8 shadow-[0_20px_40px_rgba(26,28,28,0.06)] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 min-h-[400px] flex flex-col relative">
            <h2 className="text-xl font-black tracking-tight mb-4 text-on-background">Expenditure Split</h2>
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">Functional Sub-Division</p>
              <p className="text-sm text-on-background leading-relaxed">The largest single expenditure item remains municipal schools, driven by sustained enrollment growth and specialized service costs.</p>
            </div>
            
            <div className="flex-grow w-full mt-4 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0]
                      return (
                        <div className="bg-white dark:bg-zinc-800 p-3 shadow-lg border border-zinc-200 dark:border-zinc-700 text-sm">
                          <div className="font-bold mb-1 text-zinc-900 dark:text-zinc-100">{d.name}</div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: d.payload.color }} />
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              {formatCurrency(d.value as number)}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">
                            {((d.value as number) / totalBudget * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {pieData.map((entry, i) => (
                <div className="flex items-center gap-1.5 text-xs text-secondary" key={i}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Year-over-Year Comparison */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-10 shadow-[0_20px_40px_rgba(26,28,28,0.06)] border border-zinc-200 dark:border-zinc-800 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tighter mb-1 text-on-background">Expenditure by Function</h2>
              <p className="text-sm text-secondary">Comparison: {getFiscalYearLabel(prevFY.fiscalYear)} vs. {getFiscalYearLabel(latestFY.fiscalYear)}</p>
            </div>
          </div>
          
          <div className="w-full flex-grow h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v, true)} tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="shortName" tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-3 shadow-lg border border-zinc-200 dark:border-zinc-700 text-sm">
                        <div className="font-bold mb-2 text-zinc-900 dark:text-zinc-100">{label}</div>
                        {payload.map((p, i) => (
                          <div className="flex items-center gap-2 mb-1" key={i}>
                            <div className="w-2 h-2" style={{ background: p.color }} />
                            <span className="text-zinc-600 dark:text-zinc-400 w-16">{p.name}</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(p.value as number)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
                <Bar dataKey="previous" name={getFiscalYearLabel(prevFY.fiscalYear)} fill="#a1a1aa" radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="approved" name={getFiscalYearLabel(latestFY.fiscalYear)} fill="#9e001f" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-end gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-secondary">
              <div className="w-3 h-3 bg-zinc-400 dark:bg-zinc-600" />
              <span>{getFiscalYearLabel(prevFY.fiscalYear)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <div className="w-3 h-3 bg-primary" />
              <span>{getFiscalYearLabel(latestFY.fiscalYear)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Accessible Table Section */}
      <section className="bg-white dark:bg-zinc-900 p-10 shadow-[0_20px_40px_rgba(26,28,28,0.06)] border border-zinc-200 dark:border-zinc-800 mb-16 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-on-background">Historical Budget Data</h2>
            <p className="text-sm text-secondary">All figures from Special Town Meeting approved budgets, FY2016–FY2025.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-surface-container dark:border-zinc-800">
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Fiscal Year</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Education</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Change</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Municipal</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Change</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">DPW</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Public Safety</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">General Gov</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/50 dark:divide-zinc-800/50">
              {[...completeFYs].reverse().map((fy) => (
                <tr className="hover:bg-surface-container-low dark:hover:bg-zinc-800/50 transition-colors" key={fy.fiscalYear}>
                  <td className="py-5 font-bold text-on-background border-r border-surface-container dark:border-zinc-800/50 pr-4">
                    {getFiscalYearLabel(fy.fiscalYear)}
                  </td>
                  <td className="py-5 text-sm text-right text-zinc-700 dark:text-zinc-300 pr-4">{formatCurrency(fy.education)}</td>
                  <td className="py-5 text-right border-r border-surface-container dark:border-zinc-800/50 pr-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${fy.percentChange.education && fy.percentChange.education >= 8 ? 'bg-error/10 text-error' : fy.percentChange.education && fy.percentChange.education > 0 ? 'bg-success/10 text-success' : 'bg-zinc-100 text-zinc-500'}`}>
                      {formatPercent(fy.percentChange.education)}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-right text-zinc-700 dark:text-zinc-300 pr-4">{fy.municipal ? formatCurrency(fy.municipal) : '—'}</td>
                  <td className="py-5 text-right border-r border-surface-container dark:border-zinc-800/50 pr-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${fy.percentChange.municipal && fy.percentChange.municipal >= 8 ? 'bg-error/10 text-error' : fy.percentChange.municipal && fy.percentChange.municipal > 0 ? 'bg-success/10 text-success' : 'bg-zinc-100 text-zinc-500'}`}>
                      {formatPercent(fy.percentChange.municipal)}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-right text-zinc-700 dark:text-zinc-300 pr-4">{fy.dpw ? formatCurrency(fy.dpw) : '—'}</td>
                  <td className="py-5 text-sm text-right text-zinc-700 dark:text-zinc-300 pr-4">{fy.publicSafety ? formatCurrency(fy.publicSafety) : '—'}</td>
                  <td className="py-5 text-sm text-right text-zinc-700 dark:text-zinc-300">{fy.generalGovernment ? formatCurrency(fy.generalGovernment) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


    </>
  )
}
