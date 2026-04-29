import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://piumoqyviplrahawgnjv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdW1vcXl2aXBscmFoYXdnbmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzY3NzAsImV4cCI6MjA5MzA1Mjc3MH0.SGbrRpndjNi9OmyMPa1nQy_F8RfekSkcu4TQ4QkLzZ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
