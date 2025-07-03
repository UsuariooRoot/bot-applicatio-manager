import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ApplicationProvider, useApplications } from './context/ApplicationContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { PhoneNumberInput } from './components/PhoneNumberInput';
import { ApplicationTable } from './components/ApplicationTable';
import { ApplicationDetail } from './components/ApplicationDetail';
import { ApplicationForm } from './components/ApplicationForm';
import { Application } from './types/application';

const AppContent: React.FC = () => {
  const { phoneNumber, loadApplications, error } = useApplications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailApplicationId, setDetailApplicationId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (phoneNumber) {
      loadApplications();
    }
  }, [phoneNumber, loadApplications]);

  const handleViewDetails = (application: Application) => {
    setDetailApplicationId(application._id);
  };

  const handleEditApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setSelectedApplication(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedApplication(null);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setSelectedApplication(null);
    loadApplications();
  };

  const handleDetailClose = () => {
    setDetailApplicationId(null);
  };

  if (!phoneNumber) {
    return <PhoneNumberInput />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <ApplicationTable
            onViewDetails={handleViewDetails}
            onEditApplication={handleEditApplication}
            onCreateNew={handleCreateNew}
          />
        </main>
      </div>

      {/* Modals */}
      {detailApplicationId && (
        <ApplicationDetail
          applicationId={detailApplicationId}
          phoneNumber={phoneNumber}
          onClose={handleDetailClose}
          onEdit={(app) => {
            handleDetailClose();
            handleEditApplication(app);
          }}
        />
      )}

      {showForm && (
        <ApplicationForm
          application={selectedApplication || undefined}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ApplicationProvider>
        <AppContent />
      </ApplicationProvider>
    </ThemeProvider>
  );
}

export default App;