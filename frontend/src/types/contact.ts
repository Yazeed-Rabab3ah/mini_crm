export type Contact = {
  id: number;
  username: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  is_superuser: boolean;
  notes?: string;
  created_at: string;
  profile_image_url: string;
  cover_image_url: string;
  address: string;
  team?: Team | null;
  role?: string;
  
  total_tasks?: number;
  open_tasks?: number;
  done_tasks?: number;
};

export type Team = {
  id: number;
  name: string;
  department: string;
  manager?: number | null;
  supervisor?: number | null;
  manager_username?: string | null;
  supervisor_username?: string | null;
  created_at: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ContactListParams = {
  search?: string;
  is_active?: boolean;
  ordering?: string;
  team?: number;
  page?: number;
};

export type TeamListParams = {
  department?: string;
};