import React from 'react';
import { NAIROBI_ADMIN_STRUCTURE } from '../constants';
import { ChevronRight, User, Users } from 'lucide-react';

const AdminHierarchy: React.FC = () => {
  return (
    <div className="space-y-6">
        <div>
        <h2 className="text-2xl font-bold text-gray-800">Administrative Hierarchy</h2>
        <p className="text-gray-500 mt-1">Nairobi City County Executive & Administration Units (As per Executive Dispatch 18th Nov 2025)</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {NAIROBI_ADMIN_STRUCTURE.map((borough) => (
          <div key={borough.borough} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Borough</span>
                <h3 className="text-xl font-bold text-gray-800">{borough.borough}</h3>
              </div>
              <div className="flex items-center mt-2 md:mt-0 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                 <User size={16} className="text-blue-600 mr-2" />
                 <span className="text-sm font-medium text-gray-700">{borough.manager} <span className="text-gray-400 font-normal">(Manager)</span></span>
              </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {borough.subCounties.map((sub) => (
                        <div key={sub.name} className="border border-gray-100 rounded-lg p-4 hover:border-blue-100 transition-colors">
                            <h4 className="font-bold text-lg text-blue-900 mb-3 flex items-center">
                                {sub.name} Sub-County
                            </h4>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm border-b border-gray-50 pb-1">
                                    <span className="text-gray-500">Administrator:</span>
                                    <span className="font-medium text-gray-800">{sub.administrator}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-50 pb-1">
                                    <span className="text-gray-500">Commander:</span>
                                    <span className="font-medium text-gray-800">{sub.commander}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-50 pb-1">
                                    <span className="text-gray-500">Env. Officer:</span>
                                    <span className="font-medium text-gray-800">{sub.environmentOfficer}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-50 pb-1">
                                    <span className="text-gray-500">Planning Officer:</span>
                                    <span className="font-medium text-gray-800">{sub.planningOfficer}</span>
                                </div>
                            </div>

                            <div>
                                <h5 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center">
                                    <Users size={12} className="mr-1" /> Wards
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {sub.wards.map(ward => (
                                        <span key={ward} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                                            {ward}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHierarchy;
