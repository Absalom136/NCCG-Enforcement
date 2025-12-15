import React, { useState } from 'react';
import { X, FileDown, Calendar, Users, Map } from 'lucide-react';
import { EnforcementRecord } from '../types';
import { NAIROBI_ADMIN_STRUCTURE } from '../constants';
import { generateWeeklyReport } from '../services/reportService';

interface ReportGeneratorModalProps {
  records: EnforcementRecord[];
  onClose: () => void;
}

const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ records, onClose }) => {
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(lastWeek.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [subCounty, setSubCounty] = useState('');
  const [officers, setOfficers] = useState(['', '', '']);

  // Flatten subcounties for easy selection
  const allSubCounties = NAIROBI_ADMIN_STRUCTURE.flatMap(b => b.subCounties.map(sc => sc.name)).sort();

  const handleOfficerChange = (index: number, value: string) => {
    const newOfficers = [...officers];
    newOfficers[index] = value;
    setOfficers(newOfficers);
  };

  const getFilteredRecords = () => {
    return records.filter(r => {
      const rDate = new Date(r.dateIssued);
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Include end date in range
      end.setHours(23, 59, 59, 999);
      
      const inDateRange = rDate >= start && rDate <= end;
      const inSubCounty = subCounty ? r.subCounty === subCounty : true;
      
      return inDateRange && inSubCounty;
    });
  };

  const filteredCount = getFilteredRecords().length;

  const handleGenerate = () => {
    const reportData = getFilteredRecords();
    if (reportData.length === 0) {
      alert("No records found for the selected criteria.");
      return;
    }
    
    generateWeeklyReport(
      reportData,
      startDate,
      endDate,
      subCounty || 'NAIROBI CITY COUNTY',
      officers.filter(o => o.trim() !== '')
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileDown size={24} className="mr-2 text-blue-600" />
              Generate Weekly Report
            </h2>
            <p className="text-sm text-gray-500 mt-1">Configure PDF export settings</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <Calendar size={16} className="mr-2" /> Reporting Period
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ colorScheme: 'light' }}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ colorScheme: 'light' }}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Sub County */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <Map size={16} className="mr-2" /> Jurisdiction
            </label>
            <select 
              value={subCounty}
              onChange={(e) => setSubCounty(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-900"
            >
              <option value="">Select Sub-County (Required)</option>
              {allSubCounties.map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
            {!subCounty && <p className="text-xs text-red-500 mt-1">Please select a Sub-County to format the report correctly.</p>}
          </div>

          {/* Prepared By */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <Users size={16} className="mr-2" /> Prepared By (Officers)
            </label>
            <div className="space-y-2">
              {officers.map((officer, index) => (
                <input 
                  key={index}
                  type="text" 
                  value={officer}
                  placeholder={`Officer ${index + 1} Name`}
                  onChange={(e) => handleOfficerChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-400 outline-none text-sm bg-white text-gray-900"
                />
              ))}
            </div>
          </div>

          {/* Preview Count */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm text-blue-800">Records matching criteria:</span>
            <span className="text-lg font-bold text-blue-900 bg-white px-3 py-1 rounded shadow-sm border border-blue-100">
              {filteredCount}
            </span>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end space-x-3 flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={filteredCount === 0 || !subCounty}
            className={`px-6 py-2 rounded-lg font-bold shadow-sm flex items-center ${
              filteredCount > 0 && subCounty
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FileDown size={18} className="mr-2" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorModal;