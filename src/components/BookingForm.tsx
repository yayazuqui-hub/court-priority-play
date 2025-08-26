import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SystemState, PriorityQueue } from '@/hooks/useRealtimeData';

interface BookingFormProps {
  systemState: SystemState | null;
  priorityQueue: PriorityQueue[];
  onBookingSuccess: () => void;
}

export function BookingForm({ systemState, priorityQueue, onBookingSuccess }: BookingFormProps) {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const canMakeBooking = () => {
    if (!systemState || !user) return false;
    
    // If open for all, anyone can book
    if (systemState.is_open_for_all) return true;
    
    // If in priority mode, check if user is in top 12 and timer is active
    if (systemState.is_priority_mode) {
      const userInQueue = priorityQueue.find(item => item.user_id === user.id);
      if (!userInQueue) return false;
      
      // Check if timer is running
      if (systemState.priority_timer_started_at) {
        const startTime = new Date(systemState.priority_timer_started_at).getTime();
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const timeLeft = Math.max(0, systemState.priority_timer_duration - elapsedSeconds);
        
        return timeLeft > 0;
      }
    }
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player1Name.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome do primeiro jogador.",
        variant: "destructive"
      });
      return;
    }
    
    if (!canMakeBooking()) {
      toast({
        title: "Não permitido",
        description: "Você não pode fazer marcações no momento.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user!.id,
          player1_name: player1Name.trim(),
          player2_name: player2Name.trim() || null,
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao fazer a marcação. Tente novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso! 🎉",
          description: "Marcação realizada com sucesso!",
        });
        setPlayer1Name('');
        setPlayer2Name('');
        onBookingSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao fazer a marcação.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  if (!canMakeBooking()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fazer Marcação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">
              🚫 Marcações não disponíveis no momento
            </p>
            <p className="text-sm text-muted-foreground">
              {!systemState?.is_open_for_all && !systemState?.is_priority_mode
                ? 'Sistema pausado - aguarde liberação do administrador'
                : !priorityQueue.find(item => item.user_id === user?.id)
                ? 'Você não está na fila de prioridade'
                : 'Tempo esgotado para usuários prioritários'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fazer Marcação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="player1">Jogador 1 (obrigatório)</Label>
            <Input
              id="player1"
              type="text"
              placeholder="Nome do primeiro jogador"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="player2">Jogador 2 (opcional)</Label>
            <Input
              id="player2"
              type="text"
              placeholder="Nome do segundo jogador"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Fazendo marcação...' : 'Confirmar Marcação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}