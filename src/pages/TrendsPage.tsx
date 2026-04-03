import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  AreaChart, Area,
} from 'recharts'
import { Database, TrendingUp, ArrowRight } from 'lucide-react'
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
      {/* Page Header */}
      <div className="page-header">
        <div className="page-badge">
          <TrendingUp size={12} />
          Longitudinal Analysis
        </div>
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Trends Analysis</h1>
            <p className="page-subtitle">
              A comprehensive longitudinal study of the Town's financial trajectory, 
              focusing on expenditure efficiency, projected growth, and sustained operating health.
            </p>
          </div>
          <a
            href={data.metadata.sourceLinks.FY2026}
            className="source-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Database size={14} />
            Source Data
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats" id="trends-stats">
        <div className="quick-stat">
          <div className="quick-stat-icon quick-stat-icon--primary">
            <TrendingUp size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{cagr}%</span>
            <span className="quick-stat-label">CAGR (Total)</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon quick-stat-icon--secondary">
            <TrendingUp size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{data.metadata.averageGrowthRates.education}%</span>
            <span className="quick-stat-label">Avg Education Growth</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon quick-stat-icon--tertiary">
            <TrendingUp size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{data.metadata.averageGrowthRates.municipal}%</span>
            <span className="quick-stat-label">Avg Municipal Growth</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon quick-stat-icon--success">
            <ArrowRight size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{formatCurrency(allFYs[allFYs.length - 1].education, true)}</span>
            <span className="quick-stat-label">FY27 Projection (Ed)</span>
          </div>
        </div>
      </div>

      {/* Expenditure Trajectory */}
      <div className="section-block" id="expenditure-trajectory">
        <div className="section-header">
          <div>
            <h2 className="section-title">Expenditure Trajectory</h2>
            <p className="section-subtitle">
              Historical mapping of department-level spending, {getFiscalYearLabel(first.fiscalYear)}–{getFiscalYearLabel(latest.fiscalYear)}
            </p>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingData} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#424751' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatCurrency(v, true)}
                  tick={{ fontSize: 11, fill: '#424751' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="custom-tooltip">
                        <div className="custom-tooltip-label">{label}</div>
                        {payload
                          .filter(p => p.value !== null && p.value !== undefined)
                          .sort((a, b) => (b.value as number) - (a.value as number))
                          .map((p, i) => (
                            <div className="custom-tooltip-row" key={i}>
                              <div className="custom-tooltip-dot" style={{ background: p.color }} />
                              <span className="custom-tooltip-name">{p.name}</span>
                              <span className="custom-tooltip-value">{formatCurrency(p.value as number)}</span>
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
          <div className="chart-legend">
            {SPENDING_SERIES.map(s => (
              <div
                className={`legend-chip ${!activeSpendingSeries.has(s.key) ? 'inactive' : ''}`}
                key={s.key}
                onClick={() => toggleSpending(s.key)}
              >
                <div className="legend-chip-dot" style={{ background: s.color }} />
                <span className="legend-chip-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Growth Rates */}
        <div className="section-block" id="growth-rates">
          <div className="section-header">
            <div>
              <h2 className="section-title">Growth Rates</h2>
              <p className="section-subtitle">
                Year-over-year percent change by category
              </p>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-wrapper" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#424751' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v: number) => `${v}%`}
                    tick={{ fontSize: 11, fill: '#424751' }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="custom-tooltip">
                          <div className="custom-tooltip-label">{label}</div>
                          {payload
                            .filter(p => p.value !== null && p.value !== undefined)
                            .map((p, i) => (
                              <div className="custom-tooltip-row" key={i}>
                                <div className="custom-tooltip-dot" style={{ background: p.color }} />
                                <span className="custom-tooltip-name">{p.name}</span>
                                <span className="custom-tooltip-value">{formatPercent(p.value as number)}</span>
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
            <div className="chart-legend">
              {GROWTH_SERIES.map(s => (
                <div
                  className={`legend-chip ${!activeGrowthSeries.has(s.key) ? 'inactive' : ''}`}
                  key={s.key}
                  onClick={() => toggleGrowth(s.key)}
                >
                  <div className="legend-chip-dot" style={{ background: s.color }} />
                  <span className="legend-chip-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Education vs Municipal Stacked Area */}
        <div className="section-block" id="edu-vs-muni">
          <div className="section-header">
            <div>
              <h2 className="section-title">Education vs. Municipal</h2>
              <p className="section-subtitle">
                Proportion of total approved budget
              </p>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-wrapper" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={educationShareData} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#424751' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v: number) => formatCurrency(v, true)}
                    tick={{ fontSize: 11, fill: '#424751' }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="custom-tooltip">
                          <div className="custom-tooltip-label">{label}</div>
                          {payload
                            .filter(p => p.value !== null && p.value !== undefined)
                            .map((p, i) => (
                              <div className="custom-tooltip-row" key={i}>
                                <div className="custom-tooltip-dot" style={{ background: p.color }} />
                                <span className="custom-tooltip-name">{p.name}</span>
                                <span className="custom-tooltip-value">{formatCurrency(p.value as number)}</span>
                              </div>
                            ))}
                        </div>
                      )
                    }}
                  />
                  <Area type="monotone" dataKey="municipal" name="Municipal" fill="var(--secondary-fixed)" stroke="var(--secondary)" stackId="1" />
                  <Area type="monotone" dataKey="education" name="Education" fill="var(--primary-fixed)" stroke="var(--primary)" stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              <div className="legend-chip">
                <div className="legend-chip-dot" style={{ background: 'var(--primary)' }} />
                <span className="legend-chip-label">Education</span>
              </div>
              <div className="legend-chip">
                <div className="legend-chip-dot" style={{ background: 'var(--secondary)' }} />
                <span className="legend-chip-label">Municipal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Education Projections */}
      <div className="section-block" id="projections">
        <div className="section-header">
          <div>
            <h2 className="section-title">Education Budget Projections</h2>
            <p className="section-subtitle">
              Approved and projected education spending through FY2027. Dashed line indicates projected figures.
            </p>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectedData} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <defs>
                  <linearGradient id="eduGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#424751' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => formatCurrency(v, true)}
                  tick={{ fontSize: 11, fill: '#424751' }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]
                    return (
                      <div className="custom-tooltip">
                        <div className="custom-tooltip-label">{label}</div>
                        <div className="custom-tooltip-row">
                          <div className="custom-tooltip-dot" style={{ background: 'var(--primary)' }} />
                          <span className="custom-tooltip-name">Education</span>
                          <span className="custom-tooltip-value">{formatCurrency(d.value as number)}</span>
                        </div>
                        {d.payload.isProjected && (
                          <div style={{ marginTop: 4, fontSize: '0.6875rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
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

      {/* Auditor's Note */}
      <div className="auditor-note" id="trends-note">
        <div className="auditor-note-label">Aggregate Operating Health</div>
        <p className="auditor-note-text">
          Winchester's current fiscal status remains robust. Through strategic debt management and aggressive 
          surplus preservation, the Town maintains structural balance as the primary objective of current fiscal planning. 
          By decoupling essential service funding from volatile revenue streams, Winchester has built a fiscal buffer 
          that protects long-term infrastructure investment even in contractionary economic cycles.
        </p>
      </div>
    </>
  )
}
