import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, FileWarning, Edit, AlertCircle, CheckSquare, Square, UserPlus, CheckCircle, XCircle, Download, Sparkles, Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { EnforcementRecord } from '../types';
import { generateRecordSummary } from '../services/geminiService';
import ReportGeneratorModal from './ReportGeneratorModal';

interface SearchRecordsProps {
  records: EnforcementRecord[];
  onEdit: (record: EnforcementRecord) => void;
  onBulkUpdate: (ids: string[], updates: Partial<EnforcementRecord>) => void;
  onViewRecord: (record: EnforcementRecord) => void;
  initialFilter?: string;
}

const ITEMS_PER_PAGE = 5;

const SearchRecords: React.FC<SearchRecordsProps> = ({ records, onEdit, onBulkUpdate, onViewRecord, initialFilter = 'All' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync initialFilter prop with local state when it changes (e.g., navigation from Dashboard)
  useEffect(() => {
    setFilterStatus(initialFilter);
  }, [initialFilter]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.noticeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || record.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map(r => r.id)));
    }
  };

  const handleBulkAction = (action: 'close' | 'assign') => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    if (action === 'close') {
      if (confirm(`Are you sure you want to mark ${ids.length} records as Closed?`)) {
        onBulkUpdate(ids, { status: 'Closed' });
        setSelectedIds(new Set());
      }
    } else if (action === 'assign') {
      const officerName = prompt("Enter the name of the officer to assign:");
      if (officerName) {
        onBulkUpdate(ids, { officerInCharge: officerName });
        setSelectedIds(new Set());
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Notice Number',
      'Plot Number',
      'Location',
      'Sub-County',
      'Ward',
      'Date Issued',
      'Status',
      'Process Taken',
      'Issue of Concern',
      'Recommendations',
      'Officer In Charge',
      'AI Summary'
    ];

    const csvRows = filteredRecords.map(record => {
      return [
        record.noticeNumber,
        record.plotNumber,
        `"${record.location}"`,
        record.subCounty,
        record.ward,
        record.dateIssued,
        record.status,
        record.processTaken,
        `"${record.issueOfConcern.replace(/"/g, '""')}"`, // Escape quotes
        `"${record.recommendations.replace(/"/g, '""')}"`,
        `"${record.officerInCharge}"`,
        `"${(record.aiSummary || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `enforcement_records_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateSummary = async (record: EnforcementRecord) => {
    const newSummarizing = new Set(summarizingIds);
    newSummarizing.add(record.id);
    setSummarizingIds(newSummarizing);

    try {
        const summary = await generateRecordSummary(
            record.issueOfConcern,
            record.recommendations,
            record.location
        );
        onBulkUpdate([record.id], { aiSummary: summary });
    } finally {
        setSummarizingIds(prev => {
            const next = new Set(prev);
            next.delete(record.id);
            return next;
        });
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Search Records</h2>
          <p className="text-gray-500 mt-1">Retrieve history by Plot Number or Notice Number.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <FileText size={16} className="text-red-500" />
            <span>PDF Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filteredRecords.length === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
            }`}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Enter Plot No, Notice No, or Street Name..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white shadow-sm flex-1 md:flex-none"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Pending Review">Pending</option>
            <option value="Closed">Closed</option>
          </select>
          
          <button
            onClick={toggleSelectAll}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center min-w-[120px]"
          >
            {selectedIds.size > 0 && selectedIds.size === filteredRecords.length ? (
               <><CheckSquare size={18} className="mr-2 text-yellow-500" /> Deselect All</>
            ) : (
               <><Square size={18} className="mr-2 text-gray-400" /> Select All</>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currentRecords.length > 0 ? (
          currentRecords.map((record) => {
            const isSelected = selectedIds.has(record.id);
            const isSummarizing = summarizingIds.has(record.id);

            return (
              <div 
                key={record.id} 
                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md relative overflow-hidden ${
                  isSelected ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-200'
                }`}
              >
                {/* Selection Overlay/Click Area */}
                <div 
                    className="absolute top-0 left-0 bottom-0 w-12 flex items-start justify-center pt-6 cursor-pointer z-10 hover:bg-gray-50"
                    onClick={() => toggleSelection(record.id)}
                >
                    {isSelected ? (
                        <CheckSquare className="text-yellow-500" size={20} />
                    ) : (
                        <Square className="text-gray-300" size={20} />
                    )}
                </div>

                {/* Main Content Click Area */}
                <div 
                    className="pl-12 p-6 cursor-pointer"
                    onClick={() => onViewRecord(record)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{record.plotNumber}</h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">{record.noticeNumber}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={14} className="mr-1" />
                        {record.location}, {record.subCounty}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'Open' ? 'bg-red-100 text-red-700 border border-red-200' :
                          record.status === 'Closed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {record.status}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                          className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors border border-gray-200 z-20 relative"
                        >
                          <Edit size={14} />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                            <Calendar size={16} className="text-gray-400 mt-0.5 mr-2" />
                            <span className="text-sm text-gray-700">Issued: {record.dateIssued}</span>
                        </div>
                        <div className="flex items-start">
                            <FileWarning size={16} className="text-gray-400 mt-0.5 mr-2" />
                            <span className="text-sm text-gray-700">{record.issueOfConcern}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommendation</h4>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 h-full">
                        <p className="text-sm text-gray-700 italic">"{record.recommendations}"</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary Section */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center">
                            <Sparkles size={14} className="mr-1.5" /> Executive Summary
                        </h4>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateSummary(record);
                            }}
                            disabled={isSummarizing}
                            className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center border disabled:opacity-50 ${
                                record.aiSummary 
                                    ? 'bg-white text-gray-500 border-gray-200 hover:text-indigo-600 hover:border-indigo-200' 
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200'
                            }`}
                        >
                            {isSummarizing ? (
                                <><Loader2 size={12} className="mr-1.5 animate-spin" /> {record.aiSummary ? 'Regenerating...' : 'Generating...'}</>
                            ) : (
                                <>{record.aiSummary ? 'Regenerate' : 'Generate Summary'}</>
                            )}
                        </button>
                     </div>
                     
                     {record.aiSummary && (
                         <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg text-sm text-gray-800 leading-relaxed shadow-sm">
                             {record.aiSummary}
                         </div>
                     )}
                  </div>


                  {record.attachments && record.attachments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Evidence</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {record.attachments.map((att, idx) => (
                                <div key={idx} className="flex-shrink-0 w-24 border border-gray-200 rounded-lg p-1 bg-white" title={att.name}>
                                    {att.type.startsWith('image/') ? (
                                        <img src={att.data} alt={att.name} className="h-16 w-full object-cover rounded-md" />
                                    ) : (
                                         <div className="h-16 w-full flex items-center justify-center bg-gray-50 rounded-md">
                                            <span className="text-xs text-gray-500 font-medium">DOC</span>
                                        </div>
                                    )}
                                     <p className="text-[10px] text-gray-500 truncate mt-1 text-center">{att.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                  {record.auditLog.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        Last update by {record.auditLog[record.auditLog.length - 1].user} on {record.auditLog[record.auditLog.length - 1].timestamp}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Search size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No records found</h3>
            <p className="text-gray-500">Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredRecords.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center space-x-4 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border transition-colors ${
              currentPage === 1 
                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border transition-colors ${
              currentPage === totalPages 
                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center space-x-6 min-w-[320px] max-w-[90vw] justify-between animate-in slide-in-from-bottom-5">
          <div className="flex items-center space-x-2">
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">{selectedIds.size}</span>
            <span className="font-medium text-sm">Selected</span>
          </div>
          <div className="flex items-center space-x-3">
             <button 
              onClick={() => handleBulkAction('close')}
              className="flex items-center space-x-1 hover:text-green-400 transition-colors"
              title="Mark as Closed"
            >
              <CheckCircle size={18} />
              <span className="text-sm font-medium hidden sm:inline">Close</span>
            </button>
            <div className="h-4 w-px bg-gray-700"></div>
            <button 
              onClick={() => handleBulkAction('assign')}
              className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
              title="Assign Officer"
            >
              <UserPlus size={18} />
              <span className="text-sm font-medium hidden sm:inline">Assign</span>
            </button>
            <div className="h-4 w-px bg-gray-700"></div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="hover:text-red-400 transition-colors"
              title="Clear Selection"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Report Generator Modal */}
      {showReportModal && (
        <ReportGeneratorModal 
            records={records} 
            onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
};

export default SearchRecords;