
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, MissedCollectionReport, Payment, UserType } from '@/types';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Strict validation to prevent "Invalid supabaseUrl" error from the library
  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
};

export const userService = {
  isConfigured: () => !!getSupabase(),
  async getAllUsers(): Promise<User[]> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client
      .from('profiles')
      .select('*, plan:plans(*)');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return (data || []).map(u => ({
      ...u,
      userType: u.user_type as UserType,
      hostelCiteName: u.hostel_cite_name,
      roomNumber: u.room_number,
      collectionStatus: u.collection_status,
      lastCollectionDate: u.last_collection_date,
      paymentHistory: []
    })) as User[];
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { plan, ...userData } = user;
    const dbUser = {
      user_type: userData.userType,
      name: userData.name,
      tel: userData.tel,
      location: userData.location,
      address: userData.address,
      hostel_cite_name: userData.hostelCiteName,
      individual_type: (userData as any).individualType,
      room_number: userData.roomNumber,
      directions: userData.directions,
      latitude: userData.latitude,
      longitude: userData.longitude,
      plan_id: plan.id
    };

    const { data, error } = await client
      .from('profiles')
      .insert([dbUser])
      .select('*, plan:plans(*)')
      .single();

    if (error) throw error;
    return data as User;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const dbUpdates: any = {};
    if (updates.collectionStatus) dbUpdates.collection_status = updates.collectionStatus;
    if (updates.lastCollectionDate) dbUpdates.last_collection_date = updates.lastCollectionDate;
    
    const { error } = await client
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) throw error;
  },

  async getPlans(): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client
      .from('plans')
      .select('*');
    
    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
    return data || [];
  },

  async getProfile(userId: string): Promise<User | null> {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
      .from('profiles')
      .select('*, plan:plans(*)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return {
      ...data,
      userType: data.user_type as UserType,
      hostelCiteName: data.hostel_cite_name,
      roomNumber: data.room_number,
      collectionStatus: data.collection_status,
      lastCollectionDate: data.last_collection_date,
      paymentHistory: []
    } as User;
  }
};

export const authService = {
  async signUp(email: string, password: string, userData: Omit<User, 'id'>) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Create profile
    const { plan, ...rest } = userData;
    const dbUser = {
      id: authData.user.id, // Link to auth user
      user_type: rest.userType,
      name: rest.name,
      tel: rest.tel,
      location: rest.location,
      address: rest.address,
      hostel_cite_name: rest.hostelCiteName,
      individual_type: (rest as any).individualType,
      room_number: rest.roomNumber,
      directions: rest.directions,
      latitude: rest.latitude,
      longitude: rest.longitude,
      plan_id: plan.id
    };

    const { error: profileError } = await client
      .from('profiles')
      .insert([dbUser]);

    if (profileError) throw profileError;

    return authData.user;
  },

  async signIn(email: string, password: string) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  },

  async signOut() {
    const client = getSupabase();
    if (!client) return;
    await client.auth.signOut();
  },

  async getCurrentUser() {
    const client = getSupabase();
    if (!client) return null;

    const { data: { user } } = await client.auth.getUser();
    return user;
  }
};

export const reportService = {
  async getAllReports(): Promise<MissedCollectionReport[]> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client
      .from('missed_collection_reports')
      .select('*, user:profiles(name, tel, address, location, plan:plans(*))');
    
    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return (data || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user.name,
      userTel: r.user.tel,
      location: r.user.location || r.user.address,
      schedule: r.user.plan.details || `${r.user.plan.days} | ${r.user.plan.time}`,
      timestamp: new Date(r.created_at).toLocaleString(),
      status: r.status as 'pending' | 'resolved'
    }));
  },

  async createReport(userId: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client
      .from('missed_collection_reports')
      .insert([{ user_id: userId }]);
    if (error) throw error;
  },

  async resolveReport(reportId: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client
      .from('missed_collection_reports')
      .update({ status: 'resolved' })
      .eq('id', reportId);
    if (error) throw error;
  }
};
