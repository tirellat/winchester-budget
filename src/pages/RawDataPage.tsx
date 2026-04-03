import { useMemo, useState } from 'react'
import { getBudgetData, getDetailedBudgetData, formatCurrency, getFiscalYearLabel } from '../data/budgetUtils'

type DatasetType = 'growth' | 'wps-detail'

export default function RawDataPage() {
  const data = getBudgetData()
  const detailedData = getDetailedBudgetData()
  const [activeDataset, setActiveDataset] = useState<DatasetType>('growth')

  const sortedFYs = useMemo(() => {
    return [...data.fiscalYears].sort((a, b) => b.fiscalYear.localeCompare(a.fiscalYear))
  }, [data.fiscalYears])

  const flattenedWpsDetails = useMemo(() => {
    return Object.entries(detailedData.details).flatMap(([orgName, items]) => 
      items.map(item => ({
        ...item,
        orgName: orgName.split(' (')[0]
      }))
    )
  }, [detailedData.details])

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12">
        <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-3">Data Repository</p>
        <h1 className="text-5xl md:text-6xl font-black text-on-background tracking-tighter leading-none mb-6">Raw Dataset</h1>
        <p className="text-secondary text-lg max-w-2xl leading-relaxed">Complete tabular view of all compiled budget datasets, matching the underlying structured JSON files.</p>
      </header>

      {/* Dataset Toggle */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveDataset('growth')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-widest border transition-all ${
            activeDataset === 'growth'
              ? 'bg-primary border-primary text-white'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
          }`}
        >
          District Growth Data
        </button>
        <button
          onClick={() => setActiveDataset('wps-detail')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-widest border transition-all ${
            activeDataset === 'wps-detail'
              ? 'bg-primary border-primary text-white'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
          }`}
        >
          WPS Detail Ledger
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-20">
        <div className="overflow-x-auto">
          {activeDataset === 'growth' ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">Fiscal Year</th>
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">School Year</th>
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 text-right whitespace-nowrap">Education</th>
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 text-right whitespace-nowrap">Municipal</th>
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 text-right whitespace-nowrap">DPW</th>
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 text-right whitespace-nowrap">Public Safety</th>
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 text-right whitespace-nowrap">Health/Social</th>
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 text-right whitespace-nowrap">Culture/Rec</th>
                  <th className="p-4 font-bold text-zinc-900 dark:text-zinc-100 text-right whitespace-nowrap">General Gov</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {sortedFYs.map((fy) => (
                  <tr key={fy.fiscalYear} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-bold text-on-surface whitespace-nowrap">
                      {getFiscalYearLabel(fy.fiscalYear)}
                      {fy.isProjected && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">Proj</span>}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{fy.schoolYear.replace('_', '-')}</td>
                    <td className="p-4 text-right text-zinc-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">{formatCurrency(fy.education)}</td>
                    <td className="p-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums whitespace-nowrap">{fy.municipal ? formatCurrency(fy.municipal) : '—'}</td>
                    <td className="p-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums whitespace-nowrap">{fy.dpw ? formatCurrency(fy.dpw) : '—'}</td>
                    <td className="p-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums whitespace-nowrap">{fy.publicSafety ? formatCurrency(fy.publicSafety) : '—'}</td>
                    <td className="p-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums whitespace-nowrap">{fy.healthSocialServices ? formatCurrency(fy.healthSocialServices) : '—'}</td>
                    <td className="p-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums whitespace-nowrap">{fy.cultureRecreation ? formatCurrency(fy.cultureRecreation) : '—'}</td>
                    <td className="p-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums whitespace-nowrap">{fy.generalGovernment ? formatCurrency(fy.generalGovernment) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Org</th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100">Description</th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 text-right">FY24 Actual</th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 text-right">FY25 Budget</th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 text-right">FY26 Recommended</th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 text-right">Change ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {flattenedWpsDetails.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-3 text-zinc-500 font-bold uppercase">{item.orgName}</td>
                    <td className="p-3">
                      <div className="font-black text-on-surface">{item["Account Description"]}</div>
                      <div className="text-[9px] text-zinc-400 uppercase">ORG {item.ORG} • OBJ {item.OBJ}</div>
                    </td>
                    <td className="p-3 text-right tabular-nums">{item["FY24 Actuals"]}</td>
                    <td className="p-3 text-right tabular-nums font-medium">{item["FY25 Budget ($)"]}</td>
                    <td className="p-3 text-right tabular-nums font-black text-primary">{item["FY26 Recommended Budget ($)"]}</td>
                    <td className="p-3 text-right tabular-nums">{item["Change ($)"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
