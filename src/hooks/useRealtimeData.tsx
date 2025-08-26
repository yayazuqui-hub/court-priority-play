import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemState {
  id: string;
  is_priority_mode: boolean;
  is_open_for_all: boolean;
  priority_timer_started_at: string | null;
  priority_timer_duration: number;
}

export interface PriorityQueue {
  id: string;
  user_id: string;
  position: number;
  profiles: {
    name: string;
    phone: string;
  };
}

export interface Booking {
  id: string;
  user_id: string;
  player1_name: string;
  player2_name: string | null;
  created_at: string;
  profiles: {
    name: string;
    phone: string;
  };
}

export function useRealtimeData() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [priorityQueue, setPriorityQueue] = useState<PriorityQueue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        // Fetch system state
        const { data: stateData } = await supabase
          .from('system_state')
          .select('*')
          .limit(1)
          .single();
        
        if (stateData) setSystemState(stateData);

        // Fetch priority queue
        const { data: queueData } = await supabase
          .from('priority_queue')
          .select(`
            *,
            profiles (name, phone)
          `)
          .order('position');
        
        if (queueData) setPriorityQueue(queueData);

        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles (name, phone)
          `)
          .order('created_at', { ascending: false });
        
        if (bookingsData) setBookings(bookingsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time subscriptions
    const systemStateChannel = supabase
      .channel('system-state-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_state'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSystemState(payload.new as SystemState);
          }
        }
      )
      .subscribe();

    const priorityQueueChannel = supabase
      .channel('priority-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'priority_queue'
        },
        () => {
          // Refetch priority queue on any change
          supabase
            .from('priority_queue')
            .select(`
              *,
              profiles (name, phone)
            `)
            .order('position')
            .then(({ data }) => {
              if (data) setPriorityQueue(data);
            });
        }
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          // Refetch bookings on any change
          supabase
            .from('bookings')
            .select(`
              *,
              profiles (name, phone)
            `)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              if (data) setBookings(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(systemStateChannel);
      supabase.removeChannel(priorityQueueChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  return {
    systemState,
    priorityQueue,
    bookings,
    loading,
  };
}