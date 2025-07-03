import React, { useState, useEffect } from 'react';
import { X, Building, DollarSign, Globe, Calendar, Phone, MessageSquare, ExternalLink, Edit } from 'lucide-react';
import { Application } from '../types/application';
import { useApplications } from '../context/ApplicationContext';

interface ApplicationDetailProps {
  applicationId: string;
  phoneNumber: string;
  onClose: () => void;
  onEdit: (application: Application) => void;
}

export const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  applicationId,
  phoneNumber,
  onClose,
  onEdit,
}) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const { getApplicationById } = useApplications();

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const app = await getApplicationById(applicationId, phoneNumber);
        setApplication(app);
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [applicationId, getApplicationById]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'En proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'Aceptado':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'Rechazado':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
          <p className="text-red-600 dark:text-red-400">Error loading application details</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Detalles de la Postulación
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(application)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Editar postulación"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company and Role */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {application.role}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Building className="w-5 h-5 text-gray-500" />
                <span className="text-lg text-gray-700 dark:text-gray-300">
                  {application.company}
                </span>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                application.status
              )}`}
            >
              {application.status}
            </span>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Salario</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {application.salary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Plataforma</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {application.platform}
                  </p>
                </div>
              </div>

              {application.contact && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contacto</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {application.contact}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Postulación</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>

              {application.updatedAt !== application.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(application.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job URL */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">URL de la Oferta</p>
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium break-all"
                >
                  {application.jobUrl}
                </a>
              </div>
            </div>
          </div>

          {/* Interview and Feedback */}
          {(application.interview || application.feedback) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
              {application.interview && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Entrevista</h4>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{application.interview}</p>
                  </div>
                </div>
              )}

              {application.feedback && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Feedback</h4>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{application.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};