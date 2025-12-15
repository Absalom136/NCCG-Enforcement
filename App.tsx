import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SearchRecords from './components/SearchRecords';
import EnforcementForm from './components/EnforcementForm';
import AdminHierarchy from './components/AdminHierarchy';
import RecordDetailsModal from './components/RecordDetailsModal';
import { AppView, EnforcementRecord } from './types';
import { MOCK_RECORDS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [records, setRecords] = useState<EnforcementRecord[]>(MOCK_RECORDS);
  const [editingRecord, setEditingRecord] = useState<EnforcementRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<EnforcementRecord | null>(null);
  const [initialSearchFilter, setInitialSearchFilter] = useState<string>('All');

  const handleSaveRecord = (newRecord: EnforcementRecord) => {
    setRecords((prev) => {
      const exists = prev.find(r => r.id === newRecord.id);
      if (exists) {
        return prev.map(r => r.id === newRecord.id ? newRecord : r);
      }
      return [newRecord, ...prev];
    });
    setCurrentView(AppView.SEARCH);
    setEditingRecord(null);
  };

  const handleBulkUpdate = (ids: string[], updates: Partial<EnforcementRecord>) => {
    setRecords((prev) => prev.map(record => {
      if (ids.includes(record.id)) {
        return {
          ...record,
          ...updates,
          auditLog: [
            ...record.auditLog,
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: 'Bulk Update',
              user: 'Admin'
            }
          ]
        };
      }
      return record;
    }));
  };

  const handleEditRequest = (record: EnforcementRecord) => {
    setEditingRecord(record);
    setCurrentView(AppView.NEW_ENTRY);
    setViewingRecord(null); // Close modal if open
  };

  const handleViewRecord = (record: EnforcementRecord) => {
    setViewingRecord(record);
  };

  const handleCancelForm = () => {
    setEditingRecord(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleDashboardFilter = (filter: string) => {
    setInitialSearchFilter(filter);
    setCurrentView(AppView.SEARCH);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            records={records} 
            onViewRecord={handleViewRecord} 
            onFilterSelect={handleDashboardFilter}
          />
        );
      case AppView.SEARCH:
        return (
          <SearchRecords 
            records={records} 
            onEdit={handleEditRequest} 
            onBulkUpdate={handleBulkUpdate}
            onViewRecord={handleViewRecord}
            initialFilter={initialSearchFilter}
          />
        );
      case AppView.NEW_ENTRY:
        return (
          <EnforcementForm 
            initialData={editingRecord} 
            onSave={handleSaveRecord} 
            onCancel={handleCancelForm} 
          />
        );
      case AppView.ADMIN_STRUCTURE:
        return <AdminHierarchy />;
      default:
        return <Dashboard records={records} onViewRecord={handleViewRecord} onFilterSelect={handleDashboardFilter} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderContent()}
      
      {/* Detail Modal Layer */}
      {viewingRecord && (
        <RecordDetailsModal 
          record={viewingRecord} 
          onClose={() => setViewingRecord(null)}
          onEdit={handleEditRequest}
        />
      )}
    </Layout>
  );
};

export default App;