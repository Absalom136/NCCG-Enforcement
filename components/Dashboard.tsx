import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EnforcementRecord } from '../types';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
  records: EnforcementRecord[];
  onViewRecord: (record: EnforcementRecord) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onViewRecord }) => {
  const totalNotices = records.length;
  const pending = records.filter(r => r.status === 'Open' || r.status === 'Pending Review').length;
  const closed = records.filter(r => r.status === 'Closed').length;

  const data = [
    { name: 'Open', value: records.filter(r => r.status === 'Open').length },
    { name: 'Pending', value: records.filter(r => r.status === 'Pending Review').length },
    { name: 'Closed', value: closed },
  ];

  const subCountyData = records.reduce((acc, curr) => {
    const found = acc.find(item => item.name === curr.subCounty);
    if (found) {
      found.count += 1;
    } else {
      acc.push({ name: curr.subCounty, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]);

  const COLORS = ['#FBBF24', '#60A5FA', '#34D399'];

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Enforcement Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of enforcement activities across Nairobi City County.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Notices" value={totalNotices} icon={FileText} colorClass="bg-blue-600" />
        <StatCard title="Pending Actions" value={pending} icon={Clock} colorClass="bg-yellow-500" />
        <StatCard title="Resolved Cases" value={closed} icon={CheckCircle} colorClass="bg-green-500" />
        <StatCard title="Urgent Alerts" value="2" icon={AlertTriangle} colorClass="bg-red-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 text-sm">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Enforcement by Sub-County</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subCountyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="count" fill="#1E293B" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Mock */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Recent Enforcement Actions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Notice No</th>
                <th className="px-6 py-3">Plot No</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.slice(0, 5).map((record) => (
                <tr 
                  key={record.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onViewRecord(record)}
                >
                  <td className="px-6 py-4 font-medium text-blue-600">{record.noticeNumber}</td>
                  <td className="px-6 py-4">{record.plotNumber}</td>
                  <td className="px-6 py-4">{record.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                      record.status === 'Closed' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{record.dateIssued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;