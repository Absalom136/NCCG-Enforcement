import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, FileWarning, Edit, AlertCircle, CheckSquare, Square, UserPlus, CheckCircle, XCircle, Download, Sparkles, Loader2, FileText, ChevronLeft, ChevronRight, ClipboardList, Plus } from 'lucide-react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { EnforcementRecord } from '../types';
import { generateRecordSummary, AiResult } from '../services/geminiService';
import ReportGeneratorModal from './ReportGeneratorModal';

interface SearchRecordsProps {
  records: EnforcementRecord[];
  onEdit: (record: EnforcementRecord) => void;
  onBulkUpdate: (ids: string[], updates: Partial<EnforcementRecord>) => void;
  onViewRecord: (record: EnforcementRecord) => void;
  onAddNew: () => void;
  initialFilter?: string;
  dashboardSearchTerm?: string;
}

const ITEMS_PER_PAGE = 5;

const SearchRecords: React.FC<SearchRecordsProps> = ({ 
  records, 
  onEdit, 
  onBulkUpdate, 
  onViewRecord, 
  onAddNew,
  initialFilter = 'All',
  dashboardSearchTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(dashboardSearchTerm);
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const listTopRef = useRef<HTMLDivElement>(null);

  // Sync initial props with local state when they change
  useEffect(() => {
    setFilterStatus(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    if (dashboardSearchTerm) {
      setSearchTerm(dashboardSearchTerm);
    }
  }, [dashboardSearchTerm]);

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
  
  // Scroll to top when page changes
  useEffect(() => {
    if (currentPage > 1 && listTopRef.current) {
        listTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

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

  const handleExportCSV = async () => {
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

    const rows = filteredRecords.map(r => [
      r.noticeNumber,
      r.plotNumber,
      r.location,
      r.subCounty,
      r.ward,
      r.dateIssued,
      r.status,
      r.processTaken,
      r.issueOfConcern.replace(/,/g, ';'),
      r.recommendations.replace(/,/g, ';'),
      r.officerInCharge,
      (r.aiSummary || '').replace(/,/g, ';')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const fileName = `NCC_Enforcement_Records_${new Date().toISOString().split('T')[0]}.csv`;

    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: 'Export Records',
          text: 'Enforcement records export',
          url: result.uri,
          dialogTitle: 'Share CSV'
        });
      } catch (e) {
        console.error("Export failed", e);
        alert("Native export failed.");
      }
    } else {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSummarize = async (record: EnforcementRecord) => {
    if (summarizingIds.has(record.id)) return;
    
    setSummarizingIds(prev => new Set(prev).add(record.id));
    try {
      const result = await generateRecordSummary(record.issueOfConcern, record.recommendations, record.location);
      onBulkUpdate([record.id], { aiSummary: result.text });
    } catch (error) {
      console.error("Summary failed", error);
    } finally {
      setSummarizingIds(prev => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6" ref={listTopRef}>
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by plot, notice or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
          />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Open', 'Pending Review', 'Closed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {selectedIds.size === filteredRecords.length && filteredRecords.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
            <span>Select All</span>
          </button>
          {selectedIds.size > 0 && (
            <div className="flex items-center space-x-2 border-l pl-3 ml-3 border-gray-200">
              <span className="text-xs font-bold text-indigo-600">{selectedIds.size} Selected</span>
              <button
                onClick={() => handleBulkAction('close')}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                title="Mark Closed"
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() => handleBulkAction('assign')}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                title="Assign Officer"
              >
                <UserPlus size={18} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <ClipboardList size={14} />
            <span>Weekly Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddNew}
            className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-400 text-black rounded-lg text-xs font-bold hover:bg-yellow-500 transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {currentRecords.length > 0 ? (
          currentRecords.map(record => (
            <div
              key={record.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm ${
                selectedIds.has(record.id) ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-gray-100'
              }`}
            >
              <div className="p-5 flex items-start">
                <button
                  onClick={() => toggleSelection(record.id)}
                  className={`mt-1 mr-4 ${selectedIds.has(record.id) ? 'text-indigo-600' : 'text-gray-300'}`}
                >
                  {selectedIds.has(record.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                
                <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2 cursor-pointer" onClick={() => onViewRecord(record)}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        {record.noticeNumber}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        record.status === 'Open' ? 'text-orange-600 bg-orange-100' : 
                        record.status === 'Closed' ? 'text-green-600 bg-green-100' : 
                        'text-blue-600 bg-blue-100'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 truncate">Plot {record.plotNumber}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1 shrink-0" />
                      <span className="truncate">{record.location}, {record.subCounty}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar size={12} className="mr-1.5" />
                      {record.dateIssued}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FileWarning size={12} className="mr-1.5" />
                      {record.processTaken}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    {!record.aiSummary && (
                      <button
                        onClick={() => handleSummarize(record)}
                        disabled={summarizingIds.has(record.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="AI Summarize"
                      >
                        {summarizingIds.has(record.id) ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Sparkles size={18} />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(record)}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onViewRecord(record)}
                      className="p-2 text-gray-400 hover:text-[#00875a] hover:bg-green-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FileText size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              {record.aiSummary && (
                <div className="px-5 pb-4 pt-0">
                  <div className="bg-indigo-50 rounded-xl p-3 flex items-start space-x-2 border border-indigo-100/50">
                    <Sparkles size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                      {record.aiSummary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 text-gray-400 rounded-full mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No records found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('All'); }}
              className="mt-6 text-[#00875a] font-bold text-sm uppercase tracking-wider"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, filteredRecords.length)}</span> of{' '}
                <span className="font-medium">{filteredRecords.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft size={20} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-yellow-400 border-yellow-400 text-black'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight size={20} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

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
