import React, { useState } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { useApplications } from '../context/ApplicationContext';

export const PhoneNumberInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { setPhoneNumber, loadApplications } = useApplications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setPhoneNumber(inputValue.trim());
      await loadApplications();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenido a Jobs Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ingresa tu número de teléfono para acceder a tus postulaciones
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Número de Teléfono
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="51987654321"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formato: código de país + número (ej: 51987654321)
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Acceder a mis Postulaciones
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};