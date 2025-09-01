import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/hooks/useRealtimeData';
import { Calendar, X } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  gender: string;
  level: string;
}

interface ManualBookingFormProps {
  bookings: Booking[];
}

export function ManualBookingForm({ bookings }: ManualBookingFormProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player2Level, setPlayer2Level] = useState('iniciante');
  const [player2Team, setPlayer2Team] = useState('masculino');
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const { toast } = useToast();

  // Buscar todos os perfis disponíveis
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name');

        if (error) {
          console.error('Erro ao buscar perfis:', error);
          toast({
            title: "Erro",
            description: "Erro ao carregar lista de usuários.",
            variant: "destructive"
          });
        } else {
          setProfiles(data || []);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
      }
      setLoadingProfiles(false);
    };

    fetchProfiles();
  }, [toast]);

  const createBooking = async () => {
    if (!selectedUserId) {
      toast({
        title: "Erro",
        description: "Selecione um usuário.",
        variant: "destructive"
      });
      return;
    }

    const selectedProfile = profiles.find(p => p.user_id === selectedUserId);
    if (!selectedProfile) {
      toast({
        title: "Erro",
        description: "Perfil do usuário não encontrado.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: selectedUserId,
          player1_name: selectedProfile.name,
          player2_name: player2Name.trim() || null,
          player_level: selectedProfile.level,
          team: selectedProfile.gender,
          player2_team: player2Name.trim() ? player2Team : null,
          player2_level: player2Name.trim() ? player2Level : null,
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar marcação.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: `Marcação criada para ${selectedProfile.name}.`,
        });
        // Limpar formulário
        setSelectedUserId('');
        setPlayer2Name('');
        setPlayer2Level('iniciante');
        setPlayer2Team('masculino');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar marcação.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const deleteBooking = async (booking: Booking) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao remover marcação.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Removido",
          description: `Marcação de ${booking.player1_name} removida.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover marcação.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const getProfileByUserId = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };

  return (
    <div className="space-y-6">
      {/* Formulário para criar marcação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Criar Marcação Manualmente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Selecionar Usuário Principal</Label>
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
              disabled={loadingProfiles || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingProfiles 
                    ? "Carregando usuários..." 
                    : "Selecione um usuário"
                } />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.user_id} value={profile.user_id}>
                    <div className="flex items-center gap-2">
                      <span>{profile.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {profile.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {profile.gender}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="player2">Segundo Jogador (opcional)</Label>
            <Input
              id="player2"
              type="text"
              placeholder="Nome do segundo jogador"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              disabled={loading}
            />
          </div>

          {player2Name.trim() && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Nível do Segundo Jogador</Label>
                <RadioGroup value={player2Level} onValueChange={setPlayer2Level} disabled={loading}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="iniciante" id="level2-iniciante" />
                    <Label htmlFor="level2-iniciante">Iniciante</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediario" id="level2-intermediario" />
                    <Label htmlFor="level2-intermediario">Intermediário</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="avancado" id="level2-avancado" />
                    <Label htmlFor="level2-avancado">Avançado</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Gênero do Segundo Jogador</Label>
                <RadioGroup value={player2Team} onValueChange={setPlayer2Team} disabled={loading}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="team2-masculino" />
                    <Label htmlFor="team2-masculino">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="feminino" id="team2-feminino" />
                    <Label htmlFor="team2-feminino">Feminino</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          <Button 
            onClick={createBooking}
            disabled={!selectedUserId || loading}
            className="w-full"
          >
            {loading ? 'Criando marcação...' : 'Criar Marcação'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de marcações ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Marcações Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma marcação ativa
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const profile = getProfileByUserId(booking.user_id);
                return (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{booking.player1_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {booking.player_level}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {booking.team}
                        </Badge>
                      </div>
                      
                      {booking.player2_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>+ {booking.player2_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {booking.player2_level}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {booking.player2_team}
                          </Badge>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Criado: {new Date(booking.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => deleteBooking(booking)}
                      disabled={loading}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}