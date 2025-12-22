import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Sparkles, UploadCloud, Map, FileText, Trash2, Camera as CameraIcon, AlertCircle, ExternalLink } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { EnforcementRecord, Attachment, SubCounty } from '../types';
import { NAIROBI_ADMIN_STRUCTURE } from '../constants';
import { generateRecommendations, AiResult } from '../services/geminiService';

interface EnforcementFormProps {
  initialData?: EnforcementRecord | null;
  onSave: (record: EnforcementRecord) => void;
  onCancel: () => void;
}

const EnforcementForm: React.FC<EnforcementFormProps> = ({ initialData, onSave, onCancel }) => {
  // Use local date YYYY-MM-DD
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset*60*1000));
    return local.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Partial<EnforcementRecord>>({
    plotNumber: '',
    noticeNumber: `NCC-ENF-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    location: '',
    subCounty: '',
    ward: '',
    dateIssued: getLocalDate(),
    issueOfConcern: '',
    processTaken: 'Notice Issued',
    recommendations: '',
    officerInCharge: '',
    status: 'Open',
    attachments: [],
  });

  const [selectedBorough, setSelectedBorough] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSources, setAiSources] = useState<{ uri: string; title: string }[]>([]);
  const [availableSubCounties, setAvailableSubCounties] = useState<SubCounty[]>([]);
  const [availableWards, setAvailableWards] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      const foundBorough = NAIROBI_ADMIN_STRUCTURE.find(b => 
        b.subCounties.some(sc => sc.name === initialData.subCounty)
      );
      if (foundBorough) {
        setSelectedBorough(foundBorough.borough);
        setAvailableSubCounties(foundBorough.subCounties);
        const foundSub = foundBorough.subCounties.find(sc => sc.name === initialData.subCounty);
        if (foundSub) setAvailableWards(foundSub.wards);
      }
    }
  }, [initialData]);

  const handleBoroughChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const boroughName = e.target.value;
    setSelectedBorough(boroughName);
    const borough = NAIROBI_ADMIN_STRUCTURE.find(b => b.borough === boroughName);
    setAvailableSubCounties(borough ? borough.subCounties : []);
    setFormData(prev => ({ ...prev, subCounty: '', ward: '' }));
  };

  const handleSubCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scName = e.target.value;
    const sub = availableSubCounties.find(s => s.name === scName);
    setAvailableWards(sub ? sub.wards : []);
    const officer = sub ? sub.planningOfficer : ''; 
    setFormData(prev => ({ ...prev, subCounty: scName, ward: '', officerInCharge: officer }));
  };

  const handleAiGenerate = async () => {
    if (!formData.issueOfConcern || !formData.subCounty) {
      setAiError("Please enter an Issue of Concern and select a Sub-County first.");
      return;
    }

    setAiError(null);
    setAiSources([]);
    setIsGenerating(true);
    
    try {
      const result: AiResult = await generateRecommendations(
        formData.issueOfConcern,
        formData.subCounty,
        formData.plotNumber || 'Unknown Plot'
      );
      
      if (result.text.toLowerCase().includes('error') || result.text.toLowerCase().includes('unavailable')) {
        setAiError(result.text);
      } else {
        setFormData(prev => ({ ...prev, recommendations: result.text }));
        if (result.sources) setAiSources(result.sources);
      }
    } catch (error) {
      setAiError("Failed to connect to AI service. Check internet connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        setFormData(prev => ({
          ...prev,
          attachments: [
            ...(prev.attachments || []),
            {
              name: `Photo_${new Date().getTime()}.jpg`,
              type: 'image/jpeg',
              data: image.dataUrl!
            }
          ]
        }));
      }
    } catch (error) {
      console.error('Camera error:', error);
      if (!Capacitor.isNativePlatform()) {
         alert("Camera is primarily for mobile devices. Please use 'Upload Files' on web.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            attachments: [
              ...(prev.attachments || []),
              {
                name: file.name,
                type: file.type,
                data: reader.result as string
              }
            ]
          }));
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newRecord: EnforcementRecord = {
      ...formData as EnforcementRecord,
      id: initialData ? initialData.id : `REC-${Date.now()}`,
      auditLog: initialData 
        ? [...(initialData.auditLog || []), { timestamp, action: "Updated Record", user: "Admin User" }]
        : [{ timestamp, action: "Created Record", user: "Current Officer" }]
    };
    onSave(newRecord);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{initialData ? 'Edit Enforcement Record' : 'New Enforcement Entry'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Location Section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
            <Map size={16} className="mr-2" /> Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="borough" className="block text-sm font-medium text-gray-700 mb-1">Borough</label>
              <select 
                id="borough"
                value={selectedBorough} 
                onChange={handleBoroughChange}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none"
                required
              >
                <option value="">Select Borough...</option>
                {NAIROBI_ADMIN_STRUCTURE.map(b => <option key={b.borough} value={b.borough}>{b.borough}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="subCounty" className="block text-sm font-medium text-gray-700 mb-1">Sub-County</label>
              <select 
                id="subCounty"
                value={formData.subCounty} 
                onChange={handleSubCountyChange}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none"
                required
                disabled={!selectedBorough}
              >
                <option value="">Select Sub-County...</option>
                {availableSubCounties.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
              <select 
                id="ward"
                value={formData.ward} 
                onChange={(e) => setFormData({...formData, ward: e.target.value})}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none"
                required
                disabled={!formData.subCounty}
              >
                <option value="">Select Ward...</option>
                {availableWards.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="plotNumber" className="block text-sm font-medium text-gray-700 mb-1">Plot Number</label>
              <input 
                id="plotNumber"
                type="text" 
                value={formData.plotNumber} 
                onChange={(e) => setFormData({...formData, plotNumber: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none"
                placeholder="e.g. 66/4080"
                required 
              />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Street / Road / Landmark</label>
              <input 
                id="location"
                type="text" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none"
                placeholder="e.g. Near Market, Main Street"
                required 
              />
            </div>
          </div>
        </div>

        {/* Issue Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Notice Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notice Number</label>
              <input 
                type="text" 
                value={formData.noticeNumber} 
                readOnly
                className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="dateIssued" className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
              <input 
                id="dateIssued"
                type="date" 
                value={formData.dateIssued} 
                onChange={(e) => setFormData({...formData, dateIssued: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                required 
              />
            </div>
            <div>
              <label htmlFor="processTaken" className="block text-sm font-medium text-gray-700 mb-1">Process Taken</label>
              <select 
                id="processTaken"
                value={formData.processTaken} 
                onChange={(e) => setFormData({...formData, processTaken: e.target.value as EnforcementRecord['processTaken']})}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none"
              >
                <option value="Notice Issued">Notice Issued</option>
                <option value="Warning">Warning</option>
                <option value="Arrest Made">Arrest Made</option>
                <option value="Demolition">Demolition</option>
                <option value="Compliance Verified">Compliance Verified</option>
              </select>
            </div>
             <div>
              <label htmlFor="officerInCharge" className="block text-sm font-medium text-gray-700 mb-1">Officer In Charge</label>
              <input 
                id="officerInCharge"
                type="text" 
                value={formData.officerInCharge} 
                onChange={(e) => setFormData({...formData, officerInCharge: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none"
                placeholder="Auto-filled or enter name"
              />
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Observations</h3>
            <div>
              <label htmlFor="issueOfConcern" className="block text-sm font-medium text-gray-700 mb-1">Issue of Concern</label>
              <textarea 
                id="issueOfConcern"
                value={formData.issueOfConcern} 
                onChange={(e) => setFormData({...formData, issueOfConcern: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none h-24"
                placeholder="Describe the violation..."
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700">Recommendations</label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-200 transition-colors border border-indigo-200 disabled:opacity-50"
                >
                  <Sparkles size={12} className={isGenerating ? 'animate-pulse' : ''} />
                  <span>{isGenerating ? 'Generating...' : 'AI Suggest (Search)'}</span>
                </button>
              </div>
              
              {aiError && (
                <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded-md flex items-start text-[10px] text-red-600">
                    <AlertCircle size={12} className="mr-1 mt-0.5 shrink-0" />
                    <span>{aiError}</span>
                </div>
              )}

              <textarea 
                id="recommendations"
                value={formData.recommendations} 
                onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none h-32 font-mono text-sm"
                placeholder="AI can generate this based on the issue..."
                required
              />

              {aiSources.length > 0 && (
                <div className="mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sources</p>
                    {aiSources.map((source, idx) => (
                        <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-[10px] text-indigo-600 hover:underline"
                        >
                            <ExternalLink size={10} className="mr-1" />
                            {source.title}
                        </a>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evidence Section */}
         <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Evidence</h3>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer bg-gray-50 h-32"
                    >
                        <UploadCloud size={24} className="mb-2" />
                        <p className="text-sm font-medium">Upload Files</p>
                        <span className="text-xs mt-1">Images, PDF, Docs</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                        />
                    </div>

                    <div 
                        onClick={handleTakePhoto}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 transition-all cursor-pointer bg-gray-50 h-32"
                    >
                        <CameraIcon size={24} className="mb-2" />
                        <p className="text-sm font-medium">Take Photo</p>
                        <span className="text-xs mt-1">Open Camera</span>
                    </div>
                </div>

                {formData.attachments && formData.attachments.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.attachments.map((file, index) => (
                            <div key={index} className="relative group border border-gray-200 rounded-lg p-2 flex flex-col items-center bg-white">
                                <button 
                                    onClick={() => removeAttachment(index)}
                                    type="button"
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <Trash2 size={12} />
                                </button>
                                
                                {file.type.startsWith('image/') ? (
                                    <img src={file.data} alt={file.name} className="h-24 w-full object-cover rounded-md mb-2" />
                                ) : (
                                    <div className="h-24 w-full flex items-center justify-center bg-gray-100 rounded-md mb-2">
                                        <FileText size={32} className="text-gray-400" />
                                    </div>
                                )}
                                <p className="text-xs text-gray-600 truncate w-full text-center">{file.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
         </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm flex items-center"
          >
            <Save size={18} className="mr-2" />
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnforcementForm;