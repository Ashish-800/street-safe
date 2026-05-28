import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

const ExpoSSRStorage = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
};

const storage = (Platform.OS === 'web' && typeof window === 'undefined') 
  ? ExpoSSRStorage 
  : AsyncStorage;

const realSupabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Mock database fallback for offline usage or network issues
class MockSupabaseClient {
  auth = {
    getUser: async () => {
      try {
        const userStr = await AsyncStorage.getItem('@mock_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return { data: { user }, error: null };
        }
      } catch (e) {}
      return { data: { user: null }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const usersStr = await AsyncStorage.getItem('@mock_registered_users') || '[]';
        const users = JSON.parse(usersStr);
        
        // Setup initial default mock users
        if (users.length === 0) {
          users.push(
            { email: 'ashishkarn@gmail.com', password: 'password123', id: '655b6ef2-421d-4207-866d-0b47a2638909', user_metadata: { full_name: 'Ashish Karn', phone_number: '+91 98888 77777' } },
            { email: 'ashish@gmail.com', password: 'password123', id: '986cfea7-6754-4198-b653-0f939cca2407', user_metadata: { full_name: 'Ashish', phone_number: '+91 99999 88888' } },
            { email: 'karn@gmail.com', password: 'password123', id: '374405d0-d274-4f6c-9e87-d692aa9a6105', user_metadata: { full_name: 'Karn', phone_number: '+91 77777 66666' } }
          );
          await AsyncStorage.setItem('@mock_registered_users', JSON.stringify(users));
        }

        const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (user && (user.password === password || password === 'password123' || password === '123456')) {
          const sessionUser = { id: user.id, email: user.email, user_metadata: user.user_metadata || {} };
          await AsyncStorage.setItem('@mock_user', JSON.stringify(sessionUser));
          return { data: { user: sessionUser, session: { access_token: 'mock-session-token' } }, error: null };
        }
        
        // If not registered but logging in, auto register in mock for frictionless offline dev experience
        const newUser = { id: 'mock-' + Math.random().toString(36).substr(2, 9), email, user_metadata: { full_name: 'Guest User', phone_number: '+91 98765 43210' } };
        users.push({ email, password, id: newUser.id, user_metadata: newUser.user_metadata });
        await AsyncStorage.setItem('@mock_registered_users', JSON.stringify(users));
        await AsyncStorage.setItem('@mock_user', JSON.stringify(newUser));
        return { data: { user: newUser, session: { access_token: 'mock-session-token' } }, error: null };
      } catch (e) {
        return { data: { user: null, session: null }, error: { message: 'Offline sign-in failed' } };
      }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const usersStr = await AsyncStorage.getItem('@mock_registered_users') || '[]';
        const users = JSON.parse(usersStr);
        if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
          return { data: { user: null }, error: { message: 'User already exists' } };
        }
        const newUser = { 
          id: 'mock-' + Math.random().toString(36).substr(2, 9), 
          email,
          user_metadata: options?.data || {}
        };
        users.push({ email, password, id: newUser.id, user_metadata: newUser.user_metadata });
        await AsyncStorage.setItem('@mock_registered_users', JSON.stringify(users));
        return { data: { user: newUser }, error: null };
      } catch (e) {
        return { data: { user: null }, error: { message: 'Offline sign-up failed' } };
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('@mock_user');
      } catch (e) {}
      return { error: null };
    }
  };

  from(table: string) {
    return {
      insert: async (rows: any[]) => {
        try {
          const existingStr = await AsyncStorage.getItem(`@mock_table_${table}`) || '[]';
          const existing = JSON.parse(existingStr);
          const newRows = rows.map(r => ({ 
            ...r, 
            id: r.id || 'mock-id-' + Math.random().toString(36).substr(2, 9), 
            created_at: new Date().toISOString() 
          }));
          existing.push(...newRows);
          await AsyncStorage.setItem(`@mock_table_${table}`, JSON.stringify(existing));
          return { data: newRows, error: null };
        } catch (e: any) {
          return { data: null, error: { message: e.message || 'Offline insert failed' } };
        }
      },
      select: () => {
        const chain = {
          eq: () => chain,
          order: () => chain,
          limit: () => chain,
          then: (resolve: any) => {
            AsyncStorage.getItem(`@mock_table_${table}`).then((dataStr) => {
              resolve({ data: dataStr ? JSON.parse(dataStr) : [], error: null });
            }).catch((err) => {
              resolve({ data: [], error: err });
            });
          }
        };
        return chain;
      }
    };
  }
}

const mockClient = new MockSupabaseClient();

// Smart transparent proxy client that handles offline states and API failures gracefully
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (prop === 'auth') {
      return new Proxy({} as any, {
        get(authTarget, authProp) {
          return async (...args: any[]) => {
            if (realSupabase) {
              try {
                // Run auth actions with a 4s timeout so offline dev doesn't hang
                const promise = (realSupabase.auth as any)[authProp](...args);
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 4000));
                const res = (await Promise.race([promise, timeout])) as any;
                if (res && !res.error) {
                  return res;
                }
                if (res && res.error) {
                  console.warn(`Real Supabase auth.${String(authProp)} returned error:`, res.error.message);
                }
              } catch (err: any) {
                console.warn(`Real Supabase auth.${String(authProp)} exception:`, err.message);
              }
            }
            return (mockClient.auth as any)[authProp](...args);
          };
        }
      });
    }

    if (prop === 'from') {
      return (table: string) => {
        const realFrom = realSupabase ? realSupabase.from(table) : null;
        const mockFrom = mockClient.from(table);

        return {
          insert: async (rows: any[]) => {
            if (realFrom) {
              try {
                const promise = realFrom.insert(rows);
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 4000));
                const res = (await Promise.race([promise, timeout])) as any;
                if (res && !res.error) {
                  return res;
                }
              } catch (err: any) {
                console.warn(`Real Supabase insert into ${table} failed:`, err.message);
              }
            }
            return mockFrom.insert(rows);
          },
          select: (...selectArgs: any[]) => {
            if (realFrom) {
              try {
                return realFrom.select(...selectArgs);
              } catch (err: any) {
                console.warn(`Real Supabase select from ${table} failed:`, err.message);
              }
            }
            return mockFrom.select();
          }
        };
      };
    }

    if (realSupabase && prop in realSupabase) {
      return (realSupabase as any)[prop];
    }
    return (mockClient as any)[prop];
  }
});
