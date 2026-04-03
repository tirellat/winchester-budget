import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  DollarSign, TrendingUp, School, Building2,
  ShieldCheck, Trees, Heart, Landmark, FileText,
} from 'lucide-react'
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
  const latestFY = getLatestCompleteFY()
  const totalBudget = getTotalBudget(latestFY)!
  const totalMunicipal = getTotalMunicipal(latestFY)!
  const educationPct = ((latestFY.education / totalBudget) * 100).toFixed(1)

  // Previous FY for comparison
  const completeFYs = data.fiscalYears.filter(fy => fy.municipal !== null)
  const prevFY = completeFYs[completeFYs.length - 2]
  const prevTotal = getTotalBudget(prevFY)!
  const totalGrowth = ((totalBudget - prevTotal) / prevTotal * 100).toFixed(2)

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

  // School breakdown cards
  const schoolData = data.schoolData

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-badge">
          <FileText size={12} />
          {getFiscalYearLabel(latestFY.fiscalYear)} Budget
        </div>
        <div className="page-header-top">
          <div>
            <h1 className="page-title">{getFiscalYearLabel(latestFY.fiscalYear)} Performance</h1>
            <p className="page-subtitle">
              A high-level synthesis of municipal fiscal health, contrasting projected revenues against essential expenditures with surgical precision.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="metrics-grid" id="hero-metrics">
        <div className="metric-card">
          <div className="metric-card-label">Total Budget</div>
          <div className="metric-card-value">{formatCurrency(totalBudget, true)}</div>
          <div className="metric-card-meta">Approved at Special Town Meeting</div>
          <div className={`metric-card-change metric-card-change--up`}>
            <TrendingUp size={12} />
            +{totalGrowth}% vs {getFiscalYearLabel(prevFY.fiscalYear)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Education (WPS)</div>
          <div className="metric-card-value">{formatCurrency(latestFY.education, true)}</div>
          <div className="metric-card-meta">{educationPct}% of total budget</div>
          <div className={`metric-card-change ${latestFY.percentChange.education! > 5 ? 'metric-card-change--down' : 'metric-card-change--up'}`}>
            {latestFY.percentChange.education! > 5 ? <TrendingUp size={12} /> : <TrendingUp size={12} />}
            {formatPercent(latestFY.percentChange.education)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Municipal Operations</div>
          <div className="metric-card-value">{formatCurrency(totalMunicipal, true)}</div>
          <div className="metric-card-meta">All non-education departments</div>
          <div className="metric-card-change metric-card-change--up">
            <TrendingUp size={12} />
            {formatPercent(latestFY.percentChange.municipal)}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats" id="quick-stats">
        <div className="quick-stat">
          <div className="quick-stat-icon quick-stat-icon--primary">
            <School size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{formatCurrency(latestFY.education, true)}</span>
            <span className="quick-stat-label">Education</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon quick-stat-icon--secondary">
            <ShieldCheck size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{formatCurrency(latestFY.publicSafety!, true)}</span>
            <span className="quick-stat-label">Public Safety</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon quick-stat-icon--tertiary">
            <Trees size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{formatCurrency(latestFY.dpw!, true)}</span>
            <span className="quick-stat-label">DPW</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon quick-stat-icon--success">
            <Heart size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{formatCurrency(latestFY.healthSocialServices!, true)}</span>
            <span className="quick-stat-label">Health & Social</span>
          </div>
        </div>
      </div>

      {/* Expenditure Split */}
      <div className="two-col">
        <div className="section-block" id="expenditure-split">
          <div className="section-header">
            <div>
              <h2 className="section-title">Expenditure Split</h2>
              <p className="section-subtitle">
                Education ratio — the largest single expenditure item remains municipal schools.
              </p>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-wrapper" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={130}
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
                        <div className="custom-tooltip">
                          <div className="custom-tooltip-label">{d.name}</div>
                          <div className="custom-tooltip-row">
                            <div className="custom-tooltip-dot" style={{ background: d.payload.color }} />
                            <span className="custom-tooltip-value">
                              {formatCurrency(d.value as number)}
                            </span>
                          </div>
                          <div className="custom-tooltip-row">
                            <span className="custom-tooltip-name">
                              {((d.value as number) / totalBudget * 100).toFixed(1)}% of total
                            </span>
                          </div>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              {pieData.map((entry, i) => (
                <div className="legend-chip" key={i}>
                  <div className="legend-chip-dot" style={{ background: entry.color }} />
                  <span className="legend-chip-label">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Year-over-Year Comparison */}
        <div className="section-block" id="yoy-comparison">
          <div className="section-header">
            <div>
              <h2 className="section-title">Expenditure by Function</h2>
              <p className="section-subtitle">
                Comparison: {getFiscalYearLabel(prevFY.fiscalYear)} vs. {getFiscalYearLabel(latestFY.fiscalYear)}
              </p>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-wrapper" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(194,198,211,0.15)" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v, true)} tick={{ fontSize: 11, fill: '#424751' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="shortName" tick={{ fontSize: 11, fill: '#424751', fontWeight: 600 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="custom-tooltip">
                          <div className="custom-tooltip-label">{label}</div>
                          {payload.map((p, i) => (
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
                  <Bar dataKey="previous" name={getFiscalYearLabel(prevFY.fiscalYear)} fill="var(--secondary-fixed-dim)" radius={[0, 4, 4, 0]} barSize={14} />
                  <Bar dataKey="approved" name={getFiscalYearLabel(latestFY.fiscalYear)} fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              <div className="legend-chip">
                <div className="legend-chip-dot" style={{ background: 'var(--secondary-fixed-dim)' }} />
                <span className="legend-chip-label">{getFiscalYearLabel(prevFY.fiscalYear)}</span>
              </div>
              <div className="legend-chip">
                <div className="legend-chip-dot" style={{ background: 'var(--primary)' }} />
                <span className="legend-chip-label">{getFiscalYearLabel(latestFY.fiscalYear)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auditor's Note */}
      <div className="auditor-note" id="auditor-note">
        <div className="auditor-note-label">Auditor's Note</div>
        <p className="auditor-note-text">
          Average education budget growth stands at {data.metadata.averageGrowthRates.education}% annually, 
          while municipal operations have averaged {data.metadata.averageGrowthRates.municipal}% — a structural trend 
          worth monitoring as education continues to command the majority of Winchester's fiscal resources.
        </p>
      </div>

      {/* Detailed Table */}
      <div className="section-block" id="detailed-table">
        <div className="section-header">
          <div>
            <h2 className="section-title">Historical Budget Data</h2>
            <p className="section-subtitle">
              All figures from Special Town Meeting approved budgets, FY2016–FY2025
            </p>
          </div>
          <a
            href={data.metadata.sourceLinks.FY2026}
            className="source-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={14} />
            Source Data
          </a>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fiscal Year</th>
                <th className="number">Education</th>
                <th className="number">Change</th>
                <th className="number">Municipal</th>
                <th className="number">Change</th>
                <th className="number">DPW</th>
                <th className="number">Public Safety</th>
                <th className="number">General Gov</th>
              </tr>
            </thead>
            <tbody>
              {completeFYs.map((fy) => (
                <tr key={fy.fiscalYear}>
                  <td>
                    <strong>{getFiscalYearLabel(fy.fiscalYear)}</strong>
                  </td>
                  <td className="number">{formatCurrency(fy.education)}</td>
                  <td className={`number ${getChangeClass(fy.percentChange.education)}`}>
                    {formatPercent(fy.percentChange.education)}
                  </td>
                  <td className="number">{fy.municipal ? formatCurrency(fy.municipal) : '—'}</td>
                  <td className={`number ${getChangeClass(fy.percentChange.municipal)}`}>
                    {formatPercent(fy.percentChange.municipal)}
                  </td>
                  <td className="number">{fy.dpw ? formatCurrency(fy.dpw) : '—'}</td>
                  <td className="number">{fy.publicSafety ? formatCurrency(fy.publicSafety) : '—'}</td>
                  <td className="number">{fy.generalGovernment ? formatCurrency(fy.generalGovernment) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* School-Level Breakdown */}
      <div className="section-block" id="school-breakdown">
        <div className="section-header">
          <div>
            <h2 className="section-title">School-Level Expenditure</h2>
            <p className="section-subtitle">
              Per-school budget allocation and staffing metrics
            </p>
          </div>
        </div>

        <div className="stat-pills">
          <div className="stat-pill">
            <Building2 size={14} />
            Total Enrollment: <span className="stat-pill-value">{schoolData.districtTotals.totalEnrollment.toLocaleString()}</span>
          </div>
          <div className="stat-pill">
            <DollarSign size={14} />
            Per-Pupil Spend: <span className="stat-pill-value">{formatCurrency(schoolData.districtTotals.perPupilSpend)}</span>
          </div>
          <div className="stat-pill">
            <Landmark size={14} />
            Total FTE: <span className="stat-pill-value">{schoolData.districtTotals.totalFTE}</span>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-lg)' }}>
          <h3 className="title-md" style={{ marginBottom: 'var(--space-md)' }}>Secondary Schools</h3>
          <div className="school-cards-grid">
            {[schoolData.middleSchool, schoolData.highSchool].map((school) => (
              <div className="school-card" key={school.name}>
                <div className="school-card-name">{school.name}</div>
                <div className="school-card-stat">
                  <span className="school-card-stat-label">Budget</span>
                  <span className="school-card-stat-value">{formatCurrency(school.totalBudget, true)}</span>
                </div>
                <div className="school-card-stat">
                  <span className="school-card-stat-label">Enrollment</span>
                  <span className="school-card-stat-value">{school.enrollment?.toLocaleString()}</span>
                </div>
                <div className="school-card-stat">
                  <span className="school-card-stat-label">Per Pupil</span>
                  <span className="school-card-stat-value">{formatCurrency(school.perPupilSpend!)}</span>
                </div>
                <div className="school-card-stat">
                  <span className="school-card-stat-label">FTE</span>
                  <span className="school-card-stat-value">{school.fte}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-xl)' }}>
          <h3 className="title-md" style={{ marginBottom: 'var(--space-md)' }}>Elementary Schools</h3>
          <div className="school-cards-grid">
            {schoolData.elementarySchools.map((school) => (
              <div className="school-card" key={school.name}>
                <div className="school-card-name">{school.name}</div>
                <div className="school-card-stat">
                  <span className="school-card-stat-label">Budget</span>
                  <span className="school-card-stat-value">{formatCurrency(school.totalBudget, true)}</span>
                </div>
                <div className="school-card-stat">
                  <span className="school-card-stat-label">Classrooms</span>
                  <span className="school-card-stat-value">{school.classrooms}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function getChangeClass(pct: number | null): string {
  if (pct === null) return ''
  if (pct >= 8) return 'change-high'
  if (pct > 0) return 'change-positive'
  return 'change-negative'
}
