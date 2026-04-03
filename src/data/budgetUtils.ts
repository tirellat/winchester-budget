import budgetData from '../data/budget_data.json'

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

export function getBudgetData(): BudgetDataSet {
  return budgetData as BudgetDataSet
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
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
