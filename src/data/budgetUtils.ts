import budgetData from '../data/budget_data.json'
import detailedBudgetData from '../data/fy26_budget_details.json'

export interface FiscalYearData {
  schoolYear: string
  fiscalYear: string
  townMeeting: string
  sourceLink?: string
  education: number
  municipal: number | null
  dpw: number | null
  publicSafety: number | null
  healthSocialServices: number | null
  cultureRecreation: number | null
  generalGovernment: number | null
  isProjected?: boolean
  percentChange: {
    education: number | null
    municipal: number | null
    dpw: number | null
    publicSafety: number | null
    healthSocialServices: number | null
    cultureRecreation: number | null
    generalGovernment: number | null
  }
}

export interface SchoolData {
  name: string
  enrollment?: number
  totalBudget: number
  perPupilSpend?: number
  fte?: number
  studentsPerFTE?: number
  costPerFTE?: number
  classrooms?: number
}

export interface BudgetDataSet {
  metadata: {
    title: string
    source: string
    lastUpdated: string
    averageGrowthRates: {
      education: number
      municipal: number
    }
    sourceLinks: Record<string, string>
  }
  fiscalYears: FiscalYearData[]
  schoolData: {
    middleSchool: SchoolData
    highSchool: SchoolData
    elementarySchools: SchoolData[]
    districtTotals: {
      totalEnrollment: number
      totalBudget: number
      perPupilSpend: number
      totalFTE: number
      studentsPerFTE: number
      costPerFTE: number
    }
  }
  supplementalData: {
    fy2025EducationRevised: number
    fy2025RevisedPercentChange: number
    notes: string[]
  }
}

export interface DetailedBudgetSummary {
  "Cost Center (Org)": string
  "FY25 Budgeted Personnel Services": string
  "FY25 Budgeted Expenses": string
  "FY25 Approved Total Budget": string
  "FY26 Proposed Personnel Services": string
  "FY26 Proposed Other Expenses": string
  "FY26 Proposed Total Spending": string
  "$ CHANGE FY25 VS FY26 Budget +/-": string
  "FY25 Budgeted FTE": string
  "FY26 Proposed FTE": string
  "% Change FY25 VS FY26 Budget": string
}

export interface DetailedBudgetItem {
  ORG: string
  OBJ: string
  "Account Description": string
  "FY22 Actuals": string
  "FY23 Actuals": string
  "FY24 Actuals": string
  "FY25 Budget ($)": string
  "FY25 Budget (FTE)": string
  "FY26 Recommended Budget ($)": string
  "FY26 Recommended Budget (FTE)": string
  "Change ($)": string
  "Change (FTE)": string
}

export interface DetailedBudgetDataSet {
  summary: DetailedBudgetSummary[]
  details: Record<string, DetailedBudgetItem[]>
}

export function getBudgetData(): BudgetDataSet {
  return budgetData as BudgetDataSet
}

export function getDetailedBudgetData(): DetailedBudgetDataSet {
  return detailedBudgetData as DetailedBudgetDataSet
}

export function getBudgetSummary(): DetailedBudgetSummary[] {
  return getDetailedBudgetData().summary
}

export function getOrgDetails(orgId: string): DetailedBudgetItem[] {
  const data = getDetailedBudgetData()
  // Find the org by ID (e.g., "111") in the keys of the details object
  const key = Object.keys(data.details).find(k => k.includes(`(${orgId})`))
  return key ? data.details[key] : []
}

export function getOrgName(orgId: string): string {
  const summary = getBudgetSummary()
  const item = summary.find(s => s["Cost Center (Org)"].includes(`(${orgId})`))
  return item ? item["Cost Center (Org)"].split(' (')[0] : orgId
}

export function parseCurrency(value: string): number {
  if (!value) return 0
  // Handle strings like "(1,234.56)" or "1,234.56" or "0.00"
  const clean = value.replace(/[$,()]/g, '')
  const num = parseFloat(clean)
  return value.includes('(') ? -num : num
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    const absValue = Math.abs(value)
    let formatted = ''
    if (absValue >= 1_000_000_000) formatted = `$${(absValue / 1_000_000_000).toFixed(1)}B`
    else if (absValue >= 1_000_000) formatted = `$${(absValue / 1_000_000).toFixed(1)}M`
    else if (absValue >= 1_000) formatted = `$${(absValue / 1_000).toFixed(0)}K`
    else formatted = `$${absValue.toFixed(0)}`
    
    return value < 0 ? `(${formatted})` : formatted
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function getFiscalYearLabel(fy: string): string {
  return fy.replace('FY', 'FY ')
}

/**
 * Get the total municipal spending (all non-education categories) for a fiscal year
 */
export function getTotalMunicipal(fy: FiscalYearData): number | null {
  if (
    fy.municipal === null ||
    fy.dpw === null ||
    fy.publicSafety === null ||
    fy.healthSocialServices === null ||
    fy.cultureRecreation === null ||
    fy.generalGovernment === null
  ) {
    return null
  }
  return fy.municipal + fy.dpw + fy.publicSafety + fy.healthSocialServices + fy.cultureRecreation + fy.generalGovernment
}

/**
 * Get the total budget (education + all municipal) for a fiscal year
 */
export function getTotalBudget(fy: FiscalYearData): number | null {
  const muni = getTotalMunicipal(fy)
  if (muni === null) return null
  return fy.education + muni
}

/**
 * Get the latest fiscal year with complete data
 */
export function getLatestCompleteFY(): FiscalYearData {
  const data = getBudgetData()
  const complete = data.fiscalYears.filter(fy => fy.municipal !== null)
  return complete[complete.length - 1]
}

/**
 * Get all fiscal years with complete data (for charting)
 */
export function getCompleteFiscalYears(): FiscalYearData[] {
  return getBudgetData().fiscalYears.filter(fy => fy.municipal !== null)
}
