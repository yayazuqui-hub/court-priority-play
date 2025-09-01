import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/hooks/useRealtimeData';
import { Shuffle, Users, Share2 } from 'lucide-react';

interface TeamGeneratorProps {
  bookings: Booking[];
}

interface GeneratedTeam {
  id: number;
  players: {
    name: string;
    level: string;
    gender: string;
  }[];
}

export function TeamGenerator({ bookings }: TeamGeneratorProps) {
  const [generatedTeams, setGeneratedTeams] = useState<GeneratedTeam[]>([]);

  // Extract all players from bookings
  const getAllPlayers = () => {
    const players: { name: string; level: string; gender: string }[] = [];
    
    bookings.forEach((booking) => {
      players.push({
        name: booking.player1_name,
        level: booking.player_level || 'não informado',
        gender: booking.team || 'não informado'
      });
      
      if (booking.player2_name) {
        players.push({
          name: booking.player2_name,
          level: booking.player2_level || 'não informado',
          gender: booking.player2_team || 'não informado'
        });
      }
    });
    
    return players;
  };

  const generateBalancedTeams = () => {
    const allPlayers = getAllPlayers();
    
    // Separate players by level and gender
    const playersByLevel = {
      iniciante: { masculino: [], feminino: [], 'não informado': [] },
      intermediario: { masculino: [], feminino: [], 'não informado': [] },
      avancado: { masculino: [], feminino: [], 'não informado': [] },
      'não informado': { masculino: [], feminino: [], 'não informado': [] }
    };

    allPlayers.forEach(player => {
      const level = player.level as keyof typeof playersByLevel;
      const gender = player.gender as keyof typeof playersByLevel['iniciante'];
      if (playersByLevel[level] && playersByLevel[level][gender]) {
        playersByLevel[level][gender].push(player);
      }
    });

    // Calculate teams (assuming 6 players per team for volleyball)
    const playersPerTeam = 6;
    const numTeams = Math.floor(allPlayers.length / playersPerTeam);
    const teams: GeneratedTeam[] = [];

    for (let i = 0; i < numTeams; i++) {
      teams.push({
        id: i + 1,
        players: []
      });
    }

    // Distribute players trying to balance levels and genders
    const levels = ['avancado', 'intermediario', 'iniciante', 'não informado'];
    const genders = ['masculino', 'feminino', 'não informado'];
    
    levels.forEach(level => {
      genders.forEach(gender => {
        const levelKey = level as keyof typeof playersByLevel;
        const genderKey = gender as keyof typeof playersByLevel['iniciante'];
        
        if (playersByLevel[levelKey] && playersByLevel[levelKey][genderKey]) {
          const players = [...playersByLevel[levelKey][genderKey]];
          
          // Shuffle players for randomness
          for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
          }
          
          // Distribute players across teams
          players.forEach((player, index) => {
            const teamIndex = index % numTeams;
            if (teams[teamIndex].players.length < playersPerTeam) {
              teams[teamIndex].players.push(player);
            }
          });
        }
      });
    });

    // Fill remaining spots with any leftover players
    const allAssignedPlayers = teams.flatMap(team => team.players);
    const remainingPlayers = allPlayers.filter(player => 
      !allAssignedPlayers.some(assigned => 
        assigned.name === player.name && 
        assigned.level === player.level && 
        assigned.gender === player.gender
      )
    );

    remainingPlayers.forEach(player => {
      const teamWithSpace = teams.find(team => team.players.length < playersPerTeam);
      if (teamWithSpace) {
        teamWithSpace.players.push(player);
      }
    });

    setGeneratedTeams(teams);
  };

  const exportToWhatsApp = () => {
    if (generatedTeams.length === 0) return;

    let message = "🏐 *TIMES GERADOS*\n\n";
    
    generatedTeams.forEach((team) => {
      message += `*Time ${team.id}* (${team.players.length} jogadores)\n`;
      team.players.forEach((player, index) => {
        const emoji = getGenderEmoji(player.gender);
        message += `${index + 1}. ${emoji} ${player.name} - ${player.level}\n`;
      });
      message += "\n";
    });

    message += `📊 *Total de jogadores:* ${getAllPlayers().length}\n`;
    message += `🎲 Times gerados automaticamente`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'iniciante': return 'default';
      case 'intermediario': return 'secondary';
      case 'avancado': return 'destructive';
      default: return 'outline';
    }
  };

  const getGenderEmoji = (gender: string) => {
    switch (gender) {
      case 'masculino': return '👨';
      case 'feminino': return '👩';
      default: return '❓';
    }
  };

  const totalPlayers = getAllPlayers().length;
  const canGenerate = bookings.length >= 12;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gerador de Times Balanceados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canGenerate ? (
          <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
            <div className="text-center">
              <p className="font-medium text-muted-foreground">
                Aguardando marcações suficientes
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {bookings.length}/12 marcações ativas • {totalPlayers} jogadores
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                O gerador será habilitado com 12+ marcações
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <p className="font-medium">12+ marcações ativas detectadas!</p>
              <p className="text-sm text-muted-foreground">
                Total de jogadores: {totalPlayers}
              </p>
            </div>
            <Button onClick={generateBalancedTeams} className="gap-2">
              <Shuffle className="h-4 w-4" />
              Gerar Times
            </Button>
          </div>
        )}

        {generatedTeams.length > 0 && canGenerate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Times Gerados</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToWhatsApp}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Exportar WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateBalancedTeams}
                  className="gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Regenerar
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {generatedTeams.map((team) => (
                <Card key={team.id} className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {team.id}
                      </div>
                      Time {team.id}
                      <Badge variant="outline">{team.players.length} jogadores</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {team.players.map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span>{getGenderEmoji(player.gender)}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Badge
                            variant={getLevelBadgeVariant(player.level)}
                            className="text-xs"
                          >
                            {player.level}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}