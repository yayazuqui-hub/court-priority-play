import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AuthForm } from '@/components/AuthForm';
import { PriorityTimer } from '@/components/PriorityTimer';
import { PriorityQueueDisplay } from '@/components/PriorityQueueDisplay';
import { BookingForm } from '@/components/BookingForm';
import { BookingsList } from '@/components/BookingsList';
import GamesScheduleList from '@/components/GamesScheduleList';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Settings, Calendar } from 'lucide-react';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  const { systemState, priorityQueue, bookings, gamesSchedule, loading: dataLoading } = useRealtimeData();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary">🏐 Quadra de Vôlei</h1>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {dataLoading ? (
          <div className="text-center py-8">
            <p>Carregando dados...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <PriorityTimer systemState={systemState} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Agenda de Jogos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GamesScheduleList games={gamesSchedule} />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PriorityQueueDisplay priorityQueue={priorityQueue} />
                <BookingForm
                  systemState={systemState}
                  priorityQueue={priorityQueue}
                  onBookingSuccess={() => {}}
                />
              </div>
              
              <div>
                <BookingsList bookings={bookings} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
