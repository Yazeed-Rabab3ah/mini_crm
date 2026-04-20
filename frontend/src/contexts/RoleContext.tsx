import { createContext, useContext, useState, useEffect } from 'react';
import type {ReactNode} from 'react'
import { getCurrentUserIdFromToken } from '../api/auth';
import { getContact } from '../api/contacts';
import type { UserRole, RoleContextType } from '../types/role';

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const determineRole = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const userId = getCurrentUserIdFromToken();
      if (!userId) {
        setRole(null);
        return;
      }

      const contact = await getContact(userId);

      // Check if user is manager of their team
      if (contact.role === "Manager") {
        setRole('Manager');
        return;
      }
      else if (contact.role === "Supervisor") {
        setRole('Supervisor');
        return;
      }
      else if (contact.role === "Employee") {
        setRole('Employee');
        return;
      }
      else {
        setRole("Not Defined");
        return;
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to determine role');
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshRole = async (): Promise<void> => {
    await determineRole();
  };

  useEffect(() => {
    determineRole();
  }, []);

  const value: RoleContextType = {
    role,
    isManager: role === 'Manager',
    isSupervisor: role === 'Supervisor',
    isEmployee: role === 'Employee',
    loading,
    error,
    refreshRole,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}