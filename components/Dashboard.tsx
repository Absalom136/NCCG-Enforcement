import React, { useState } from 'react';
import { EnforcementRecord } from '../types';
import { FileText, AlertTriangle, CheckCircle, Search, Info, ArrowRight } from 'lucide-react';

interface DashboardProps {
  records: EnforcementRecord[];
  onViewRecord: (record: EnforcementRecord) => void;
  onFilterSelect: (filter: string, searchTerm?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onViewRecord, onFilterSelect }) => {
  const [localSearch, setLocalSearch] = useState('');
  
  const totalNotices = records.length;
  const pending = records.filter(r => r.status === 'Open' || r.status === 'Pending Review').length;
  const closed = records.filter(r => r.status === 'Closed').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterSelect('All', localSearch);
  };

  const StatTile = ({ title, value, icon: Icon, bgColor, textColor, onClick }: any) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 min-w-[100px] flex-1 active:bg-gray-50 transition-colors"
    >
      <div className={`p-2 rounded-xl ${bgColor} ${textColor} mb-2`}>
        <Icon size={24} />
      </div>
      <span className="text-2xl font-black text-gray-900">{value}</span>
      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">{title}</span>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white pb-10">
      {/* Hero Section */}
      <div className="bg-[#00875a] p-8 pb-20 relative">
        <div className="flex justify-between items-start mb-8">
           <div className="text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Nairobi City County</p>
              <h1 className="text-3xl font-black tracking-tight">Enforcement Portal</h1>
           </div>
           <button className="text-white opacity-80 hover:opacity-100 bg-white/10 p-2 rounded-full backdrop-blur-sm">
             <Info size={22} />
           </button>
        </div>

        {/* Search Overlay - Fixed and Styled as per reference */}
        <div className="absolute left-6 right-6 -bottom-10 z-10">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search 
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00875a] transition-colors" 
              size={22} 
            />
            <input 
              type="text" 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search plot number, notice..."
              className="w-full bg-white rounded-[2rem] py-6 pl-14 pr-6 shadow-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 transition-all border border-gray-100 text-lg"
            />
            {localSearch && (
               <button 
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#00875a] text-white p-2 rounded-full shadow-lg"
               >
                 <ArrowRight size={20} />
               </button>
            )}
          </form>
        </div>
      </div>

      {/* Content Body */}
      <div className="mt-16 px-6 space-y-10">
        {/* Quick Stats Grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide">
          <StatTile 
            title="Total" 
            value={totalNotices} 
            icon={FileText} 
            bgColor="bg-green-50" 
            textColor="text-green-600"
            onClick={() => onFilterSelect('All')}
          />
          <StatTile 
            title="Pending" 
            value={pending} 
            icon={AlertTriangle} 
            bgColor="bg-orange-50" 
            textColor="text-orange-500"
            onClick={() => onFilterSelect('Pending Review')}
          />
          <StatTile 
            title="Closed" 
            value={closed} 
            icon={CheckCircle} 
            bgColor="bg-blue-50" 
            textColor="text-blue-600"
            onClick={() => onFilterSelect('Closed')}
          />
        </div>

        {/* Recent Section */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Notices</h3>
            <button 
              onClick={() => onFilterSelect('All')}
              className="text-[#00875a] text-sm font-black uppercase tracking-wider flex items-center"
            >
              See All <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {records.slice(0, 3).map((record) => (
              <div 
                key={record.id}
                onClick={() => onViewRecord(record)}
                className="bg-gray-50 rounded-3xl p-5 flex items-center border border-gray-100 active:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-[#00875a] shrink-0 mr-4 shadow-sm">
                   <FileText size={28} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 truncate text-lg">Plot {record.plotNumber}</h4>
                  <p className="text-sm text-gray-500 truncate font-medium">{record.location}</p>
                </div>
                <div className="text-right ml-2">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    record.status === 'Open' ? 'text-orange-600 bg-orange-100' : 
                    record.status === 'Closed' ? 'text-green-600 bg-green-100' : 
                    'text-blue-600 bg-blue-100'
                  }`}>
                    {record.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-2 font-black opacity-60 tracking-tighter">{record.dateIssued}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Card */}
        <div className="bg-[#00875a] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
           <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-yellow-400/20 rounded-full"></div>
           
           <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-3">
                 <div className="bg-yellow-400 p-2 rounded-xl text-gray-900 shadow-lg">
                    <AlertTriangle size={20} />
                 </div>
                 <h4 className="font-black uppercase tracking-wider text-sm">Compliance Guideline</h4>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                Always verify physical planning permits against the master register before issuing demolition warnings. Ensure AI recommendations are cross-checked with sub-county bylaws.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;