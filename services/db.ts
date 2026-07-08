
import { FeedbackData } from '../types';
import { supabase } from './supabase';

const DB_KEY = 'dxn_feedback_store';
const TABLE_NAME = 'feedback';

// Flag to track if cloud is currently reachable
let isCloudActive = !!supabase;

export const dbService = {
  isUsingCloud(): boolean {
    return isCloudActive;
  },

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!supabase) {
      isCloudActive = false;
      return { 
        success: false, 
        message: 'Client not initialized', 
        details: 'Ensure SUPABASE_URL starts with https:// and keys are set.' 
      };
    }

    try {
      const { data, error, status } = await supabase
        .from(TABLE_NAME)
        .select('id')
        .limit(1);

      if (error) {
        isCloudActive = false;
        return { 
          success: false, 
          message: `Cloud Error (${status})`, 
          details: error.message 
        };
      }
      
      isCloudActive = true;
      return { success: true, message: 'Cloud Connected' };
    } catch (e: any) {
      isCloudActive = false;
      return { 
        success: false, 
        message: 'Connection Failed', 
        details: e.message || 'Check your internet or Supabase API URL.' 
      };
    }
  },

  async saveLocally(data: FeedbackData): Promise<void> {
    const existing = await this.getAllFeedbackLocal();
    localStorage.setItem(DB_KEY, JSON.stringify([...existing, data]));
  },

  async getAllFeedbackLocal(): Promise<FeedbackData[]> {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveFeedback(data: FeedbackData): Promise<void> {
    if (!this.isUsingCloud()) {
      return this.saveLocally(data);
    }

    try {
      const { error } = await supabase!
        .from(TABLE_NAME)
        .insert([data]);

      if (error) throw error;
    } catch (err) {
      console.warn("Cloud save failed, falling back to local storage:", err);
      isCloudActive = false; // Disable cloud for subsequent calls
      return this.saveLocally(data);
    }
  },

  async getAllFeedback(): Promise<FeedbackData[]> {
    if (!this.isUsingCloud()) {
      return this.getAllFeedbackLocal();
    }

    try {
      const { data, error } = await supabase!
        .from(TABLE_NAME)
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error("Fetch Error:", error.message);
        isCloudActive = false;
        return this.getAllFeedbackLocal();
      }
      return data || [];
    } catch (e) {
      console.error("Connection error:", e);
      isCloudActive = false;
      return this.getAllFeedbackLocal();
    }
  },

  async updateFeedback(updatedFeedback: FeedbackData): Promise<void> {
    if (!this.isUsingCloud()) {
      const existing = await this.getAllFeedbackLocal();
      const index = existing.findIndex(f => f.id === updatedFeedback.id);
      if (index !== -1) {
        existing[index] = updatedFeedback;
        localStorage.setItem(DB_KEY, JSON.stringify(existing));
      }
      return;
    }

    try {
      const { error } = await supabase!
        .from(TABLE_NAME)
        .update(updatedFeedback)
        .eq('id', updatedFeedback.id);

      if (error) throw error;
    } catch (err) {
      console.warn("Cloud update failed, falling back to local storage:", err);
      isCloudActive = false;
      
      const existing = await this.getAllFeedbackLocal();
      const index = existing.findIndex(f => f.id === updatedFeedback.id);
      if (index !== -1) {
        existing[index] = updatedFeedback;
        localStorage.setItem(DB_KEY, JSON.stringify(existing));
      }
    }
  },

  async clearAll(): Promise<void> {
    if (!this.isUsingCloud()) {
      localStorage.removeItem(DB_KEY);
      return;
    }

    try {
      const { error } = await supabase!
        .from(TABLE_NAME)
        .delete()
        .neq('id', '0'); 

      if (error) throw error;
    } catch (err) {
      console.warn("Cloud clear failed, clearing local storage:", err);
      isCloudActive = false;
      localStorage.removeItem(DB_KEY);
    }
  }
};
