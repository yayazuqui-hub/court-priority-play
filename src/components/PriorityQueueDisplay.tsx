import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriorityQueue } from '@/hooks/useRealtimeData';
import { useAuth } from '@/hooks/useAuth';

interface PriorityQueueDisplayProps {
  priorityQueue: PriorityQueue[];
}

export function PriorityQueueDisplay({ priorityQueue }: PriorityQueueDisplayProps) {
  const { user } = useAuth();

  const userPosition = priorityQueue.find(item => item.user_id === user?.id)?.position;

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
                      {item.profiles.phone}
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
      </CardContent>
    </Card>
  );
}