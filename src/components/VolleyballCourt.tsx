import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  player1_name: string;
  player2_name?: string;
  team?: string;
  player2_team?: string;
  player_level?: string;
  player2_level?: string;
}

interface VolleyballCourtProps {
  bookings: Booking[];
}

export function VolleyballCourt({ bookings }: VolleyballCourtProps) {
  // Separate players by team
  const teamA = bookings.filter(booking => booking.team === 'A');
  const teamB = bookings.filter(booking => booking.team === 'B');

  const renderPlayer = (name: string, level?: string, position: string = '') => (
    <div className="flex flex-col items-center p-2 bg-white/90 rounded-lg border border-primary/20 min-h-[60px] justify-center">
      <span className="text-xs font-semibold text-primary truncate max-w-[80px]" title={name}>
        {name}
      </span>
      {level && (
        <Badge variant="outline" className="text-xs mt-1 px-1 py-0">
          {level}
        </Badge>
      )}
    </div>
  );

  const renderEmptyPosition = () => (
    <div className="flex items-center justify-center p-2 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30 min-h-[60px]">
      <span className="text-xs text-muted-foreground">Vazio</span>
    </div>
  );

  // Get all players from team A
  const teamAPlayers: Array<{name: string, level?: string}> = [];
  teamA.forEach(booking => {
    teamAPlayers.push({ name: booking.player1_name, level: booking.player_level });
    if (booking.player2_name) {
      teamAPlayers.push({ name: booking.player2_name, level: booking.player2_level });
    }
  });

  // Get all players from team B
  const teamBPlayers: Array<{name: string, level?: string}> = [];
  teamB.forEach(booking => {
    teamBPlayers.push({ name: booking.player1_name, level: booking.player_level });
    if (booking.player2_name) {
      teamBPlayers.push({ name: booking.player2_name, level: booking.player2_level });
    }
  });

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardContent className="p-6">
        <div className="relative">
          {/* Court Background */}
          <div className="volleyball-gradient rounded-lg p-1">
            <div className="bg-background rounded-lg p-4">
              
              {/* Team A Side */}
              <div className="mb-4">
                <div className="text-center mb-2">
                  <Badge className="bg-primary">Time A</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {/* Front row - positions 4, 3, 2 */}
                  {teamAPlayers[0] ? renderPlayer(teamAPlayers[0].name, teamAPlayers[0].level) : renderEmptyPosition()}
                  {teamAPlayers[1] ? renderPlayer(teamAPlayers[1].name, teamAPlayers[1].level) : renderEmptyPosition()}
                  {teamAPlayers[2] ? renderPlayer(teamAPlayers[2].name, teamAPlayers[2].level) : renderEmptyPosition()}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* Back row - positions 5, 6, 1 */}
                  {teamAPlayers[3] ? renderPlayer(teamAPlayers[3].name, teamAPlayers[3].level) : renderEmptyPosition()}
                  {teamAPlayers[4] ? renderPlayer(teamAPlayers[4].name, teamAPlayers[4].level) : renderEmptyPosition()}
                  {teamAPlayers[5] ? renderPlayer(teamAPlayers[5].name, teamAPlayers[5].level) : renderEmptyPosition()}
                </div>
              </div>

              {/* Net */}
              <div className="h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full my-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-accent/50 to-accent/30 rounded-full blur-sm"></div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white bg-primary px-2 py-1 rounded">
                  REDE
                </div>
              </div>

              {/* Team B Side */}
              <div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {/* Back row - positions 1, 6, 5 */}
                  {teamBPlayers[0] ? renderPlayer(teamBPlayers[0].name, teamBPlayers[0].level) : renderEmptyPosition()}
                  {teamBPlayers[1] ? renderPlayer(teamBPlayers[1].name, teamBPlayers[1].level) : renderEmptyPosition()}
                  {teamBPlayers[2] ? renderPlayer(teamBPlayers[2].name, teamBPlayers[2].level) : renderEmptyPosition()}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {/* Front row - positions 2, 3, 4 */}
                  {teamBPlayers[3] ? renderPlayer(teamBPlayers[3].name, teamBPlayers[3].level) : renderEmptyPosition()}
                  {teamBPlayers[4] ? renderPlayer(teamBPlayers[4].name, teamBPlayers[4].level) : renderEmptyPosition()}
                  {teamBPlayers[5] ? renderPlayer(teamBPlayers[5].name, teamBPlayers[5].level) : renderEmptyPosition()}
                </div>
                <div className="text-center mt-2">
                  <Badge className="bg-accent">Time B</Badge>
                </div>
              </div>

            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>Time A: {teamAPlayers.length}/6 jogadores</span>
            <span>Time B: {teamBPlayers.length}/6 jogadores</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}