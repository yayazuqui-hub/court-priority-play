import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/hooks/useRealtimeData';
import { Trash2 } from 'lucide-react';

interface BookingsListProps {
  bookings: Booking[];
  isAdmin?: boolean;
}

export function BookingsList({ bookings, isAdmin = false }: BookingsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDeleteBooking = async (bookingId: string, bookingUserId: string) => {
    // Check if user can delete (owner or admin)
    if (!isAdmin && bookingUserId !== user?.id) {
      toast({
        title: "Não autorizado",
        description: "Você só pode excluir suas próprias marcações.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir marcação.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Marcação excluída com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir marcação.",
        variant: "destructive"
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Marcações Ativas
          <Badge variant="outline">{bookings.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            Nenhuma marcação ativa no momento
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-lg border ${
                  booking.user_id === user?.id
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-card'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">🏐 {booking.player1_name}</p>
                      {booking.player2_name && (
                        <>
                          <span className="text-muted-foreground">+</span>
                          <p className="font-medium">{booking.player2_name}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Marcado por: {booking.profiles.name}</p>
                      <p>Telefone: {booking.profiles.phone}</p>
                      <p>Data: {formatDateTime(booking.created_at)}</p>
                    </div>
                    
                    {booking.user_id === user?.id && (
                    <Badge className="mt-2 bg-success text-success-foreground">
                      Sua marcação
                    </Badge>
                    )}
                  </div>
                  
                  {(booking.user_id === user?.id || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.id, booking.user_id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}