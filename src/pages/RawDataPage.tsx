import { useMemo, useState } from 'react'
import { Search, ChevronUp, ChevronDown, Minus } from 'lucide-react'
import { getBudgetData, getDetailedBudgetData, formatCurrency, getFiscalYearLabel, parseCurrency } from '../data/budgetUtils'

type DatasetType = 'growth' | 'wps-detail'

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function RawDataPage() {
  const data = getBudgetData()
  const detailedData = getDetailedBudgetData()
  const [activeDataset, setActiveDataset] = useState<DatasetType>('growth')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)

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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedDetails = useMemo(() => {
    let results = flattenedWpsDetails;

    // Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      results = results.filter(item => 
        item.orgName.toLowerCase().includes(lowerSearch) ||
        item["Account Description"].toLowerCase().includes(lowerSearch) ||
        item.ORG.toLowerCase().includes(lowerSearch) ||
        item.OBJ.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    if (sortConfig) {
      results = [...results].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        // Handle numeric/currency columns
        if (['FY24 Actuals', 'FY25 Budget ($)', 'FY26 Recommended Budget ($)', 'Change ($)'].includes(sortConfig.key)) {
          const aNum = parseCurrency(aValue as string);
          const bNum = parseCurrency(bValue as string);
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Handle string columns
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return results;
  }, [flattenedWpsDetails, searchTerm, sortConfig]);

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <Minus className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12">
        <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-3">Data Repository</p>
        <h1 className="text-5xl md:text-6xl font-black text-on-background tracking-tighter leading-none mb-6">Raw Dataset</h1>
        <p className="text-secondary text-lg max-w-2xl leading-relaxed">Complete tabular view of all compiled budget datasets, matching the underlying structured JSON files.</p>
      </header>

      {/* Dataset Toggle & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveDataset('growth')
              setSearchTerm('')
              setSortConfig(null)
            }}
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

        {activeDataset === 'wps-detail' && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Org, Account, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all rounded-none"
            />
          </div>
        )}
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
                      {fy.isProjected && (
                        <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          {fy.note || 'Proj'}
                        </span>
                      )}
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
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('orgName')}>
                    <div className="flex items-center gap-2 uppercase tracking-widest text-[10px]">Org <SortIcon column="orgName" /></div>
                  </th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('Account Description')}>
                    <div className="flex items-center gap-2 uppercase tracking-widest text-[10px]">Description <SortIcon column="Account Description" /></div>
                  </th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('FY24 Actuals')}>
                    <div className="flex items-center justify-end gap-2 uppercase tracking-widest text-[10px]">FY24 Actual <SortIcon column="FY24 Actuals" /></div>
                  </th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('FY25 Budget ($)')}>
                    <div className="flex items-center justify-end gap-2 uppercase tracking-widest text-[10px]">FY25 Budget <SortIcon column="FY25 Budget ($)" /></div>
                  </th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('FY26 Recommended Budget ($)')}>
                    <div className="flex items-center justify-end gap-2 uppercase tracking-widest text-[10px]">FY26 Rec <SortIcon column="FY26 Recommended Budget ($)" /></div>
                  </th>
                  <th className="p-3 font-bold text-zinc-900 dark:text-zinc-100 text-right cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('Change ($)')}>
                    <div className="flex items-center justify-end gap-2 uppercase tracking-widest text-[10px]">Change ($/%) <SortIcon column="Change ($)" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredAndSortedDetails.map((item, idx) => {
                  const changeAmt = parseCurrency(item["Change ($)"]);
                  const prevAmt = parseCurrency(item["FY25 Budget ($)"]);
                  const pctChange = prevAmt !== 0 ? (changeAmt / prevAmt * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-3 text-zinc-500 font-bold uppercase">{item.orgName}</td>
                      <td className="p-3">
                        <div className="font-black text-on-surface">{item["Account Description"]}</div>
                        <div className="text-[9px] text-zinc-400 uppercase">ORG {item.ORG} • OBJ {item.OBJ}</div>
                      </td>
                      <td className="p-3 text-right tabular-nums">{item["FY24 Actuals"]}</td>
                      <td className="p-3 text-right tabular-nums font-medium">{item["FY25 Budget ($)"]}</td>
                      <td className="p-3 text-right tabular-nums font-black text-primary">{item["FY26 Recommended Budget ($)"]}</td>
                      <td className="p-3 text-right tabular-nums">
                        <div className={`font-medium ${changeAmt > 0 ? 'text-red-600' : changeAmt < 0 ? 'text-green-600' : 'text-zinc-500'}`}>
                          {item["Change ($)"]}
                        </div>
                        <div className="text-[9px] text-zinc-400 font-bold mt-0.5">
                          {changeAmt > 0 ? '+' : ''}{pctChange}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
