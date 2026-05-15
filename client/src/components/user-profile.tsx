import { useAuth } from "../lib/simple-auth-client";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, Trophy, Star, Target } from "lucide-react";
import { useLocation } from "wouter";

export default function UserProfile() {
  const { user, signOut, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  const pointsToNextLevel = (user.level * 100) - (user.points % 100);
  const currentLevelProgress = (user.points % 100);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">Olá, {user.name}!</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button
          size="sm"
          onClick={handleLogout}
          className="rpg-button"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold"><span className="number">{user.points}</span> pontos</span>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>Nível <span className="number">{user.level}</span></span>
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso do nível</span>
            <span className="text-muted-foreground"><span className="number">{currentLevelProgress}</span>/<span className="number">100</span></span>
          </div>
          <Progress value={currentLevelProgress} className="h-2" />
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span><span className="number">{pointsToNextLevel}</span> pontos para o próximo nível</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}