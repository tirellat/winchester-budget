import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, Cell,
} from 'recharts'
// icons removed
import {
  getBudgetData,
  getCompleteFiscalYears,
  formatCurrency,
  formatPercent,
  getFiscalYearLabel,
  getTotalBudget,
  getTotalMunicipal,
} from '../data/budgetUtils'

interface SeriesConfig {
  key: string
  label: string
  color: string
  dashed?: boolean
}

const SPENDING_SERIES: SeriesConfig[] = [
  { key: 'education', label: 'Education (WPS)', color: '#00346f' },
  { key: 'municipal', label: 'Municipal Services', color: '#48626e' },
  { key: 'publicSafety', label: 'Public Safety', color: '#691700' },
  { key: 'dpw', label: 'DPW', color: '#5c8a5c' },
  { key: 'generalGovernment', label: 'General Government', color: '#546E7A' },
  { key: 'cultureRecreation', label: 'Culture & Recreation', color: '#2e7d32' },
  { key: 'healthSocialServices', label: 'Health & Social', color: '#7b5ea7' },
]

const GROWTH_SERIES: SeriesConfig[] = [
  { key: 'education', label: 'Education', color: '#00346f' },
  { key: 'municipal', label: 'Municipal', color: '#48626e' },
  { key: 'dpw', label: 'DPW', color: '#5c8a5c' },
  { key: 'publicSafety', label: 'Public Safety', color: '#691700' },
]

export default function TrendsPage() {
  const data = getBudgetData()
  const completeFYs = getCompleteFiscalYears()
  const allFYs = data.fiscalYears

  const [activeSpendingSeries, setActiveSpendingSeries] = useState<Set<string>>(
    new Set(SPENDING_SERIES.map(s => s.key))
  )
  const [activeGrowthSeries, setActiveGrowthSeries] = useState<Set<string>>(
    new Set(GROWTH_SERIES.map(s => s.key))
  )

  const toggleSpending = (key: string) => {
    setActiveSpendingSeries(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleGrowth = (key: string) => {
    setActiveGrowthSeries(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Spending trajectory data
  const spendingData = useMemo(() => {
    return completeFYs.map(fy => ({
      name: getFiscalYearLabel(fy.fiscalYear),
      education: fy.education,
      municipal: fy.municipal,
      dpw: fy.dpw,
      publicSafety: fy.publicSafety,
      healthSocialServices: fy.healthSocialServices,
      cultureRecreation: fy.cultureRecreation,
      generalGovernment: fy.generalGovernment,
    }))
  }, [completeFYs])

  // CAGR sparkline data
  const cagrData = useMemo(() => {
    return completeFYs.map(fy => ({
      name: getFiscalYearLabel(fy.fiscalYear),
      total: getTotalBudget(fy)
    }))
  }, [completeFYs])

  // Growth rate data (% change)
  const growthData = useMemo(() => {
    return completeFYs
      .filter(fy => fy.percentChange.education !== null)
      .map(fy => ({
        name: getFiscalYearLabel(fy.fiscalYear),
        education: fy.percentChange.education,
        municipal: fy.percentChange.municipal,
        dpw: fy.percentChange.dpw,
        publicSafety: fy.percentChange.publicSafety,
      }))
  }, [completeFYs])

  // Education vs Total Area Chart (education share over time)
  const educationShareData = useMemo(() => {
    return completeFYs.map(fy => {
      const total = getTotalBudget(fy)
      return {
        name: getFiscalYearLabel(fy.fiscalYear),
        education: fy.education,
        municipal: getTotalMunicipal(fy),
        total,
        eduPct: total ? ((fy.education / total) * 100).toFixed(1) : null,
      }
    })
  }, [completeFYs])

  // All years including projections
  const projectedData = useMemo(() => {
    return allFYs.map(fy => ({
      name: getFiscalYearLabel(fy.fiscalYear),
      education: fy.education,
      isProjected: fy.isProjected,
    }))
  }, [allFYs])

  // Quick stats (latest complete FY)
  const latest = completeFYs[completeFYs.length - 1]
  const latestTotal = getTotalBudget(latest)!
  const first = completeFYs[0]
  const firstTotal = getTotalBudget(first)!
  const cagr = ((Math.pow(latestTotal / firstTotal, 1 / (completeFYs.length - 1)) - 1) * 100).toFixed(1)

  return (
    <>
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-5xl">
        <div className="max-w-2xl">
          <span className="text-primary font-bold tracking-widest uppercase text-xs">Fiscal Intelligence Portal</span>
          <h1 className="text-5xl md:text-6xl font-black text-on-surface tracking-tighter mt-2 leading-none">Winchester Trends Analysis.</h1>
          <p className="text-secondary mt-6 text-lg leading-relaxed">A comprehensive longitudinal study of the Town's financial trajectory, focusing on expenditure efficiency, projected growth, and sustained operating health.</p>
        </div>
        <div className="flex gap-4">
          <a className="flex items-center gap-2 text-primary font-bold text-sm border-b-2 border-primary/20 hover:border-primary transition-all pb-1" href={data.metadata.sourceLinks.FY2026} target="_blank" rel="noreferrer">
            <span className="material-symbols-outlined text-sm">database</span> Source Data
          </a>
        </div>
      </header>

      {/* Bento Grid Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
        
        {/* KPI: CAGR */}
        <div className="md:col-span-4 bg-surface-container-low dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between shadow-[0_20px_40px_rgba(26,28,28,0.06)]">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Budget CAGR</label>
            <div className="text-4xl font-black text-on-background mt-1">{cagr}%</div>
            <p className="text-xs text-zinc-500 mt-2 font-medium">Compound Annual Growth Rate</p>
          </div>
          <div className="mt-8 h-16 w-full -ml-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cagrData} margin={{ top: 5, right: 2, bottom: 5, left: 2 }}>
                <XAxis dataKey="name" hide />
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Tooltip
                  cursor={{stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '3 3'}}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-2 shadow-lg border border-zinc-200 dark:border-zinc-700 text-xs z-50">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{label}</div>
                        <div className="font-medium text-primary mt-1">{formatCurrency(payload[0].value as number, true)}</div>
                      </div>
                    )
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#9e001f" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-400">
              <span>{getFiscalYearLabel(first.fiscalYear)}</span>
              <span>{getFiscalYearLabel(latest.fiscalYear)}</span>
            </div>
          </div>
        </div>

        {/* KPI: Education Growth */}
        <div className="md:col-span-4 bg-surface-container-low dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between shadow-[0_20px_40px_rgba(26,28,28,0.06)]">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Avg Education Growth</label>
            <div className="text-4xl font-black text-success mt-1">+{data.metadata.averageGrowthRates.education}%</div>
            <p className="text-xs text-zinc-500 mt-2 font-medium">Annual Average</p>
          </div>
          <div className="mt-8 h-16 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" hide />
                <Tooltip
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-2 shadow-lg border border-zinc-200 dark:border-zinc-700 text-xs z-50">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{label}</div>
                        <div className="font-medium text-success mt-1">
                          {(payload[0].value as number) > 0 ? '+' : ''}{payload[0].value as number}%
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="education" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {growthData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#2e7d32" fillOpacity={0.2 + (index / (growthData.length - 1)) * 0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI: Municipal Growth */}
        <div className="md:col-span-4 bg-surface-container-low dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between shadow-[0_20px_40px_rgba(26,28,28,0.06)]">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Avg Municipal Growth</label>
            <div className="text-4xl font-black text-on-surface mt-1">+{data.metadata.averageGrowthRates.municipal}%</div>
            <p className="text-xs text-zinc-500 mt-2 font-medium">Annual Average</p>
          </div>
          <div className="mt-8 h-16 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" hide />
                <Tooltip
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-2 shadow-lg border border-zinc-200 dark:border-zinc-700 text-xs z-50">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{label}</div>
                        <div className="font-medium text-primary mt-1">
                          {(payload[0].value as number) > 0 ? '+' : ''}{payload[0].value as number}%
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="municipal" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {growthData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#9e001f" fillOpacity={0.2 + (index / (growthData.length - 1)) * 0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Primary Visual: Expenditure Trajectory */}
        <div className="md:col-span-8 bg-surface-container-lowest dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_rgba(26,28,28,0.06)] p-10 border-l-4 border-l-primary flex flex-col min-h-[400px]">
          <div className="flex flex-col mb-8">
            <h3 className="text-2xl font-black tracking-tight text-on-background">Expenditure Trajectory</h3>
            <p className="text-sm text-secondary mt-1">Historical mapping of department-level spending, {getFiscalYearLabel(first.fiscalYear)}–{getFiscalYearLabel(latest.fiscalYear)}</p>
          </div>
          
          <div className="flex-grow w-full relative min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" className="-ml-3">
              <LineChart data={spendingData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatCurrency(v, true)}
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-3 shadow-lg border border-zinc-200 dark:border-zinc-700 text-sm z-50">
                        <div className="font-bold mb-2 text-zinc-900 dark:text-zinc-100">{label}</div>
                        {payload
                          .filter(p => p.value !== null && p.value !== undefined)
                          .sort((a, b) => (b.value as number) - (a.value as number))
                          .map((p, i) => (
                            <div className="flex items-center gap-2 mb-1" key={i}>
                              <div className="w-2 h-2" style={{ background: p.color }} />
                              <span className="text-zinc-600 dark:text-zinc-400">{p.name}</span>
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 ml-auto">{formatCurrency(p.value as number)}</span>
                            </div>
                          ))}
                      </div>
                    )
                  }}
                />
                {SPENDING_SERIES.map(s => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={activeSpendingSeries.has(s.key) ? 2.5 : 1}
                    dot={activeSpendingSeries.has(s.key) ? { r: 3, fill: s.color } : false}
                    hide={!activeSpendingSeries.has(s.key)}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {SPENDING_SERIES.map(s => (
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeSpendingSeries.has(s.key) 
                    ? 'border-transparent bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 opacity-60 hover:opacity-100'
                }`}
                key={s.key}
                onClick={() => toggleSpending(s.key)}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, opacity: activeSpendingSeries.has(s.key) ? 1 : 0.4 }} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Side Card: Education vs Municipal (Area Chart) */}
        <div className="md:col-span-4 bg-surface-container-lowest dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_rgba(26,28,28,0.06)] p-10 flex flex-col min-h-[400px]">
          <h3 className="text-xl font-bold tracking-tight mb-2 text-on-background">Funding Allocation</h3>
          <p className="text-secondary text-xs leading-relaxed mb-8">Education vs Municipal proportion of total approved budget.</p>
          <div className="flex-grow w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" className="-ml-4">
              <AreaChart data={educationShareData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => formatCurrency(v, true)}
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-3 shadow-lg border border-zinc-200 dark:border-zinc-700 text-sm z-50">
                        <div className="font-bold mb-2 text-zinc-900 dark:text-zinc-100">{label}</div>
                        {payload
                          .filter(p => p.value !== null && p.value !== undefined)
                          .map((p, i) => (
                            <div className="flex items-center gap-2 mb-1" key={i}>
                              <div className="w-2 h-2" style={{ background: p.color }} />
                              <span className="text-zinc-600 dark:text-zinc-400">{p.name}</span>
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 ml-auto">{formatCurrency(p.value as number)}</span>
                            </div>
                          ))}
                      </div>
                    )
                  }}
                />
                <Area type="monotone" dataKey="municipal" name="Municipal" fill="#48626e" stroke="#48626e" strokeWidth={1} stackId="1" fillOpacity={0.6} />
                <Area type="monotone" dataKey="education" name="Education" fill="#00346f" stroke="#00346f" strokeWidth={1} stackId="1" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-6 text-xs font-bold text-secondary">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3" style={{ background: '#48626e' }} /> Municipal
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3" style={{ background: '#00346f' }} /> Education
             </div>
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Growth Rates */}
        <div className="bg-surface-container-lowest dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_rgba(26,28,28,0.06)] p-10 flex flex-col min-h-[400px]">
          <div className="flex flex-col mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-on-background">Growth Rates</h2>
            <p className="text-sm text-secondary mt-1">Year-over-year percent change by category.</p>
          </div>
          
          <div className="flex-grow w-full relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" className="-ml-3">
              <LineChart data={growthData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-3 shadow-lg border border-zinc-200 dark:border-zinc-700 text-sm z-50">
                        <div className="font-bold mb-2 text-zinc-900 dark:text-zinc-100">{label}</div>
                        {payload
                          .filter(p => p.value !== null && p.value !== undefined)
                          .map((p, i) => (
                            <div className="flex items-center gap-2 mb-1" key={i}>
                              <div className="w-2 h-2" style={{ background: p.color }} />
                              <span className="text-zinc-600 dark:text-zinc-400">{p.name}</span>
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 ml-auto">{formatPercent(p.value as number)}</span>
                            </div>
                          ))}
                      </div>
                    )
                  }}
                />
                {GROWTH_SERIES.map(s => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={activeGrowthSeries.has(s.key) ? 2.5 : 1}
                    dot={activeGrowthSeries.has(s.key) ? { r: 3, fill: s.color } : false}
                    hide={!activeGrowthSeries.has(s.key)}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {GROWTH_SERIES.map(s => (
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeGrowthSeries.has(s.key) 
                    ? 'border-transparent bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 opacity-60 hover:opacity-100'
                }`}
                key={s.key}
                onClick={() => toggleGrowth(s.key)}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, opacity: activeGrowthSeries.has(s.key) ? 1 : 0.4 }} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Education Projections */}
        <div className="bg-surface-container-lowest dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_rgba(26,28,28,0.06)] p-10 flex flex-col min-h-[400px]">
          <div className="flex flex-col mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-on-background">Education Forecast</h2>
            <p className="text-sm text-secondary mt-1">Approved and estimated spending through FY2027.</p>
          </div>
          
          <div className="flex-grow w-full relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" className="-ml-3">
              <AreaChart data={projectedData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="eduGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => formatCurrency(v, true)}
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]
                    return (
                      <div className="bg-white dark:bg-zinc-800 p-3 shadow-lg border border-zinc-200 dark:border-zinc-700 text-sm z-50">
                        <div className="font-bold mb-1 text-zinc-900 dark:text-zinc-100">{label}</div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2" style={{ background: 'var(--primary)' }} />
                          <span className="text-zinc-600 dark:text-zinc-400">Education</span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100 ml-auto">{formatCurrency(d.value as number)}</span>
                        </div>
                        {d.payload.isProjected && (
                          <div className="mt-1 text-[10px] uppercase font-bold tracking-widest text-primary">
                            Projected
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="education"
                  name="Education"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#eduGrad)"
                  dot={(props: any) => {
                    const { cx, cy, payload } = props
                    if (cx == null || cy == null) return null
                    if (payload?.isProjected) {
                      return (
                        <circle
                          key={`dot-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="var(--surface-container-lowest)"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                        />
                      )
                    }
                    return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="var(--primary)" />
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </>
  )
}
