import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface HealthStatus {
  frontend: boolean;
  backend: boolean;
  mongodb: boolean;
  auth: boolean;
}

export function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    frontend: true,
    backend: false,
    mongodb: false,
    auth: false
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isBackendHealthy = await apiService.healthCheck();
        const isMongoHealthy = isBackendHealthy;
        
        const token = localStorage.getItem('token');
        const isAuthHealthy = !!token;

        setStatus({
          frontend: true,
          backend: isBackendHealthy,
          mongodb: isMongoHealthy,
          auth: isAuthHealthy
        });
      } catch {
        setStatus(prev => ({ ...prev, backend: false, mongodb: false }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const allOk = Object.values(status).every(s => s === true);

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${allOk ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
        <span className="text-sm font-medium text-slate-700">System Health:</span>
      </div>
      <div className="flex gap-3">
        {['Frontend', 'Backend', 'MongoDB', 'Auth'].map((name, i) => {
          const keys = ['frontend', 'backend', 'mongodb', 'auth'] as const;
          const isHealthy = status[keys[i]];
          return (
            <div key={name} className="flex items-center gap-1.5">
              {isHealthy ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-xs font-medium text-slate-600">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
