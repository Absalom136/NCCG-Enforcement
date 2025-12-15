import React from 'react';
import { X, MapPin, Calendar, User, FileText, AlertTriangle, Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { EnforcementRecord } from '../types';

interface RecordDetailsModalProps {
  record: EnforcementRecord;
  onClose: () => void;
  onEdit: (record: EnforcementRecord) => void;
}

const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({ record, onClose, onEdit }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
         {/* Header */}
         <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-start z-10">
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono font-medium tracking-wide">
                        {record.noticeNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        record.status === 'Open' ? 'bg-red-50 text-red-700 border-red-100' :
                        record.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                        {record.status}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Plot {record.plotNumber}</h2>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin size={14} className="mr-1" />
                    {record.location}, {record.subCounty}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => { onClose(); onEdit(record); }}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                    Edit Record
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
         </div>

         {/* Content */}
         <div className="p-8 space-y-8">
            {/* AI Summary Banner */}
            {record.aiSummary && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-start gap-3">
                     <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                        <FileText size={20} className="text-indigo-600" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-indigo-900 mb-1">Executive Summary</h4>
                        <p className="text-sm text-indigo-800 leading-relaxed">{record.aiSummary}</p>
                     </div>
                </div>
            )}

            {/* Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                        <AlertTriangle size={16} className="mr-2 text-gray-400" /> Violation Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Issue of Concern</span>
                            <p className="text-gray-800 mt-1 font-medium">{record.issueOfConcern}</p>
                        </div>
                         <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Process Taken</span>
                            <p className="text-gray-800 mt-1">{record.processTaken}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">Date Issued</span>
                                <div className="flex items-center mt-1 text-gray-700">
                                    <Calendar size={14} className="mr-1.5 text-gray-400" />
                                    {record.dateIssued}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">Officer In Charge</span>
                                <div className="flex items-center mt-1 text-gray-700">
                                    <User size={14} className="mr-1.5 text-gray-400" />
                                    {record.officerInCharge || 'Unassigned'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                        <CheckCircle size={16} className="mr-2 text-gray-400" /> Recommendations
                    </h3>
                    <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 h-full">
                        <p className="text-gray-800 italic leading-relaxed whitespace-pre-line">
                            "{record.recommendations}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Evidence Gallery */}
            {(record.attachments && record.attachments.length > 0) && (
                 <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                        <ImageIcon size={16} className="mr-2 text-gray-400" /> Evidence & Attachments
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {record.attachments.map((att, idx) => (
                            <div key={idx} className="group relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 aspect-square flex flex-col">
                                <a href={att.data} download={att.name} className="flex-1 flex items-center justify-center p-2 relative">
                                     {att.type.startsWith('image/') ? (
                                        <img src={att.data} alt={att.name} className="h-full w-full object-cover rounded-lg" />
                                    ) : (
                                         <FileText size={40} className="text-gray-400" />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-white/90 text-xs font-bold px-2 py-1 rounded shadow-sm">Download</span>
                                    </div>
                                </a>
                                <div className="bg-white p-2 border-t border-gray-100 text-xs text-center text-gray-600 truncate font-medium">
                                    {att.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Audit Log */}
            <div className="border-t border-gray-100 pt-8">
                 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                    <Clock size={16} className="mr-2 text-gray-400" /> History & Audit Trail
                </h3>
                <div className="relative border-l border-gray-200 ml-3 space-y-6">
                    {record.auditLog.map((log, idx) => (
                        <div key={idx} className="ml-6 relative">
                            <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-white"></span>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm font-medium text-gray-900">{log.action}</span>
                                <span className="text-xs text-gray-500 font-mono">{log.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">by {log.user}</p>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RecordDetailsModal;