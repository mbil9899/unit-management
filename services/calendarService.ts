import { supabase } from '@/lib/supabase';
import { UnitEvent } from '@/types/calendar';

export const calendarService = {
  // Fetch all events
  async getEvents(): Promise<UnitEvent[]> {
    const { data, error } = await supabase
      .from('unit_events')
      .select('*')
      .order('start_time', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },

  // Create a new event
  async createEvent(event: Omit<UnitEvent, 'id' | 'created_at' | 'created_by'>) {
    const { data, error } = await supabase
      .from('unit_events')
      .insert([event])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  // Delete an event
  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('unit_events')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};