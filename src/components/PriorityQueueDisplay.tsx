import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriorityQueue } from '@/hooks/useRealtimeData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface PriorityQueueDisplayProps {
  priorityQueue: PriorityQueue[];
}

export function PriorityQueueDisplay({ priorityQueue }: PriorityQueueDisplayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const userPosition = priorityQueue.find(item => item.user_id === user?.id)?.position;
  const userInQueue = priorityQueue.find(item => item.user_id === user?.id);

  const joinQueue = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Find the next position in the queue
      const nextPosition = priorityQueue.length + 1;

      const { error } = await supabase
        .from('priority_queue')
        .insert({
          user_id: user.id,
          position: nextPosition
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao entrar na fila de prioridade.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso! 🎉",
          description: "Você entrou na fila de prioridade!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao entrar na fila.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const leaveQueue = async () => {
    if (!user || !userInQueue) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('priority_queue')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao sair da fila de prioridade.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Você saiu da fila de prioridade.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao sair da fila.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Fila de Prioridade
          <Badge variant="outline">{priorityQueue.length}/12</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {priorityQueue.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhum usuário na fila de prioridade
          </p>
        ) : (
          <div className="space-y-2">
            {priorityQueue.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.user_id === user?.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={index < 3 ? "default" : "secondary"}>
                    #{item.position}
                  </Badge>
                  <div>
                    <p className="font-medium">{item.profiles.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.profiles.email}
                    </p>
                  </div>
                </div>
                {item.user_id === user?.id && (
                  <Badge className="bg-success text-success-foreground">
                    Você
                  </Badge>
                )}
              </div>
            ))}
            
            {userPosition && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  🎯 Sua posição: #{userPosition}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userPosition <= 12 ? 
                    'Você tem prioridade para marcação!' : 
                    'Você está na lista de espera.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-center">
          {userInQueue ? (
            <Button 
              variant="outline" 
              onClick={leaveQueue} 
              disabled={loading}
              size="sm"
            >
              {loading ? 'Saindo...' : 'Sair da Fila'}
            </Button>
          ) : (
            <Button 
              onClick={joinQueue} 
              disabled={loading || priorityQueue.length >= 12}
              size="sm"
            >
              {loading ? 'Entrando...' : 'Entrar na Fila'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}