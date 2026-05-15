import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Code, 
  Star, 
  Trophy, 
  User, 
  Mail, 
  ArrowLeft,
  Settings,
  LogOut,
  CheckCircle2,
  RefreshCw,
  Download,
  Copy,
  Swords,
  Shield,
  Wand2,
  Zap,
  Home,
  ChevronRight,
  Crown,
  Gem,
  Sparkles,
  Sword
} from "lucide-react";
import { useAuth } from "@/lib/simple-auth-client";
import { Header } from "@/components/header";
import { GlowCard } from "@/components/spotlight-card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Exercise } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("Novato");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Lista de avatares disponíveis
  const avatarOptions = [
    { id: 'male1', path: '/avatars/rpg-male-1.JPG', name: 'Guerreiro' },
    { id: 'male2', path: '/avatars/rpg-male-2.JPG', name: 'Mago' },
    { id: 'male3', path: '/avatars/rpg-male-3.JPG', name: 'Espadachim' },
    { id: 'female1', path: '/avatars/rpg-female-1.JPG', name: 'Arqueira' },
    { id: 'female2', path: '/avatars/rpg-female-2.JPG', name: 'Templária' },
    { id: 'female3', path: '/avatars/rpg-female-3.JPG', name: 'Maga' },
  ];

  // Fetch all exercises to calculate total available points
  const { data: exercises } = useQuery({
    queryKey: ["/api/exercises"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch current user data with avatar
  const { data: currentUser, refetch: refetchUser } = useQuery({
    queryKey: ["/api/user"],
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const queryClient = useQueryClient();

  // Invalidate and refetch user data when component mounts
  useEffect(() => {
    if (user) {
      // Invalidate all user-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/user"] });
    }
  }, [user, queryClient]);

  useEffect(() => {
    const userData = currentUser || user;
    if (userData) {
      setName(userData.name || "");
      setDescription(userData.description || "");
      setSelectedAvatar(userData.avatar || null);
      setGithub(userData.github || "");
      setLinkedin(userData.linkedin || "");
    }
  }, [user, currentUser]);


  const handleEdit = async () => {
    // Validar LinkedIn se preenchido
    if (linkedin.trim() && !linkedin.trim().match(/^https:\/\/(www\.)?linkedin\.com\//)) {
      toast({
        title: "LinkedIn inválido",
        description: "O LinkedIn deve ser uma URL válida começando com https://linkedin.com/",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Get session ID from localStorage or user
      const sessionId = localStorage.getItem('codequest_session_id') || user?.id;
      
      if (!sessionId) {
        throw new Error('Usuário não autenticado');
      }

      const updateData = {
        name: name.trim(),
        description: description.trim(),
        avatar: selectedAvatar,
        github: github.trim(),
        linkedin: linkedin.trim()
      };
      
      console.log("🚀 Dados sendo enviados:", updateData);
      
      const response = await fetch('/api/auth/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        let errorMessage = 'Falha ao atualizar perfil';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Se não conseguir parsear o JSON do erro, usar mensagem padrão
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Show success toast
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
        className: "bg-green-50 text-green-900 border-green-200",
      });
      
      // Refetch user data to get updated info
      await refetchUser();
      
      // Invalidate all user-related queries to ensure header updates
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/user"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] }),
        queryClient.refetchQueries({ queryKey: ["/api/user"] })
      ]);
      
      // Update local user data if needed
      if (result.user) {
        console.log('Profile updated successfully:', result.user);
      }
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      
      // Show error toast
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : 'Erro ao atualizar perfil. Tente novamente.',
        className: "bg-red-50 text-red-900 border-red-200",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate total points available in the system
  const totalAvailablePoints = Array.isArray(exercises) 
    ? exercises.reduce((total: number, ex: Exercise) => total + ex.points, 0)
    : 0;

  // Calculate user's percentage of total points
  const getUserPercentage = (userPoints: number, totalPoints: number) => {
    if (totalPoints === 0) return 0;
    return (userPoints / totalPoints) * 100;
  };

  const getUserLevel = (points: number) => {
    const percentage = getUserPercentage(points, totalAvailablePoints);
    
    // Level based on percentage of total points earned
    if (percentage >= 81) return 6; // 81-100% = Mitológico
    if (percentage >= 65) return 5; // 65-80% = Lendário
    if (percentage >= 49) return 4; // 49-64% = Elite
    if (percentage >= 33) return 3; // 33-48% = Veterano
    if (percentage >= 17) return 2; // 17-32% = Aventureiro
    return 1; // 0-16% = Novato
  };

  const getProgressToNextLevel = (points: number) => {
    const percentage = getUserPercentage(points, totalAvailablePoints);
    const thresholds = [0, 17, 33, 49, 65, 81, 100];
    
    // Find current level threshold and next threshold
    let currentThreshold = 0;
    let nextThreshold = 17;
    
    if (percentage >= 81) {
      currentThreshold = 81;
      nextThreshold = 100; // Max level cap
    } else if (percentage >= 65) {
      currentThreshold = 65;
      nextThreshold = 81;
    } else if (percentage >= 49) {
      currentThreshold = 49;
      nextThreshold = 65;
    } else if (percentage >= 33) {
      currentThreshold = 33;
      nextThreshold = 49;
    } else if (percentage >= 17) {
      currentThreshold = 17;
      nextThreshold = 33;
    }
    
    const progressInLevel = percentage - currentThreshold;
    const levelRange = nextThreshold - currentThreshold;
    const progressPercentage = Math.round((progressInLevel / levelRange) * 100);
    
    // Calculate actual points needed for next threshold
    const pointsForNextThreshold = Math.ceil((nextThreshold / 100) * totalAvailablePoints);
    
    return {
      percentage: Math.min(progressPercentage, 100),
      nextThreshold: pointsForNextThreshold,
      currentPercentage: Math.round(percentage)
    };
  };

  // Get user rank based on percentage of total points earned
  const getUserRank = (xp: number) => {
    const percentage = getUserPercentage(xp, totalAvailablePoints);
    
    if (percentage >= 81) return { 
      name: "Mitológico", 
      icon: Crown, 
      color: "#E8B4BC", // Mythic pink
      bgColor: "rgba(232, 180, 188, 0.15)",
      borderColor: "rgba(232, 180, 188, 0.3)"
    };
    if (percentage >= 65) return { 
      name: "Lendário", 
      icon: Star, 
      color: "#FFD700", // Legendary yellow/gold
      bgColor: "rgba(255, 215, 0, 0.15)",
      borderColor: "rgba(255, 215, 0, 0.3)"
    };
    if (percentage >= 49) return { 
      name: "Elite", 
      icon: Gem, 
      color: "#FF8C00", // Epic orange
      bgColor: "rgba(255, 140, 0, 0.15)",
      borderColor: "rgba(255, 140, 0, 0.3)"
    };
    if (percentage >= 33) return { 
      name: "Veterano", 
      icon: Shield, 
      color: "#5E5CFF", // Rare blue
      bgColor: "rgba(94, 92, 255, 0.15)",
      borderColor: "rgba(94, 92, 255, 0.3)"
    };
    if (percentage >= 17) return { 
      name: "Aventureiro", 
      icon: Sword, 
      color: "#50C878", // Uncommon green
      bgColor: "rgba(80, 200, 120, 0.15)",
      borderColor: "rgba(80, 200, 120, 0.3)"
    };
    return { 
      name: "Novato", 
      icon: Sparkles, 
      color: "#C0C0C0", // Common gray
      bgColor: "rgba(192, 192, 192, 0.15)",
      borderColor: "rgba(192, 192, 192, 0.3)"
    };
  };

  const getClassIcon = (level: number) => {
    if (level >= 10) return <Wand2 className="w-8 h-8 text-purple-400" />;
    if (level >= 5) return <Swords className="w-8 h-8 text-blue-400" />;
    if (level >= 3) return <Shield className="w-8 h-8 text-green-400" />;
    return <Zap className="w-8 h-8 text-yellow-400" />;
  };

  const getClassTitle = (level: number) => {
    if (level >= 10) return "Mago Supremo";
    if (level >= 5) return "Guerreiro";
    if (level >= 3) return "Guardião";
    return "Novato";
  };

  const handleReset = () => {
    setName(user?.name || "");
    setDescription("");
    setTitle("Novato");
    setUpdateMessage("Perfil resetado para padrão!");
  };

  const handleCopyCode = () => {
    const profileCode = `// ${name || "Usuário"}
// Nível: ${user ? getUserLevel(user.totalPoints || 0) : 1}
// Título: ${title}
// Pontos: ${user?.totalPoints || 0}
// Descrição: ${description || "Nenhuma descrição"}`;

    navigator.clipboard.writeText(profileCode);
    setUpdateMessage("Código copiado para área de transferência!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <GlowCard glowColor="purple" customSize={true} className="w-full max-w-md mx-4">
          <div className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2 text-foreground">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar seu perfil.
            </p>
            <Link href="/auth/signin">
              <Button className="rpg-button">Fazer Login</Button>
            </Link>
          </div>
        </GlowCard>
      </div>
    );
  }

  const displayUser = currentUser || user;
  const userPoints = displayUser?.totalPoints || 0;
  const userLevel = getUserLevel(userPoints);
  const userRank = getUserRank(userPoints);

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Breadcrumb Navigation - following the same style as exercises pages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                Início
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <li>
              <span className="text-purple-400 font-medium">Perfil do Aventureiro</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        {/* 8-bit Character Creator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Details Section - Left Side */}
          <GlowCard glowColor="purple" customSize={true} className="h-fit">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Dados do Usuário</h1>
              </div>


              <form className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-white font-bold text-sm">Nome</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isUpdating}
                    required
                    className="input-8bit"
                    placeholder="Digite seu nome..."
                    data-testid="input-name"
                  />
                </div>

                {/* Avatar Selection */}
                <div className="space-y-2">
                  <Label className="text-white font-bold text-sm">Avatar</Label>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/50">
                      <AvatarImage src={selectedAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`} />
                      <AvatarFallback className="text-sm bg-primary/20 text-foreground">
                        {getUserInitials(name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      onClick={() => setShowAvatarSelector(true)}
                      className="rpg-button"
                      size="sm"
                    >
                      Escolher Avatar
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-white font-bold text-sm">Sobre</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUpdating}
                    className="input-8bit resize-none"
                    rows={4}
                    placeholder="Descreva seu personagem..."
                    data-testid="input-description"
                  />
                </div>

                

                {/* Social Links */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white font-bold text-sm">GitHub</Label>
                    <Input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="input-8bit"
                      placeholder="usuario ou https://github.com/usuario"
                      data-testid="input-github"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-bold text-sm">LinkedIn</Label>
                    <Input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="input-8bit"
                      placeholder="https://linkedin.com/in/seu-perfil"
                      data-testid="input-linkedin"
                      pattern="https://.*linkedin\.com/.*"
                      title="Digite uma URL válida do LinkedIn (deve começar com https://linkedin.com/ ou https://www.linkedin.com/)"
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <Label className="text-white font-bold text-sm">X</Label>
                    <Input
                      type="text"
                      className="input-8bit"
                      placeholder="usuario ou https://x.com/usuario"
                      data-testid="input-x"
                    />
                  </div>*/}
                </div> 

                {/* Badge Title */}
                {/* <div className="space-y-2">
                  <Label className="text-white font-bold text-sm">Badge Title</Label>
                  <Select value={title} onValueChange={setTitle}>
                    <SelectTrigger className="input-8bit" data-testid="select-title">
                      <SelectValue placeholder="Escolha um título" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-primary/50">
                      <SelectItem value="Novato" className="text-foreground hover:bg-primary/20">Novato</SelectItem>
                      <SelectItem value="Guerreiro" className="text-foreground hover:bg-primary/20">Guerreiro</SelectItem>
                      <SelectItem value="Guardião" className="text-foreground hover:bg-primary/20">Guardião</SelectItem>
                      <SelectItem value="Mago" className="text-foreground hover:bg-primary/20">Mago</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </form>

              <Separator className="my-6 border-primary/30" />

              {/* Account Management */}
              <div className="space-y-4">
                <Button 
                  onClick={handleEdit}
                  disabled={isUpdating}
                  className="rpg-button w-full"
                  data-testid="button-save"
                >
                  {isUpdating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  {isUpdating ? "Salvando..." : "Salvar Perfil"}
                </Button>
              </div>
            </div>
          </GlowCard>

          {/* Preview Section - Right Side */}
          <div>
            {/* Character Preview */}
            <GlowCard glowColor="green" customSize={true} className="h-fit">
              <div className="p-6">
                <div className="mb-6">
                </div>

                {/* Character Card */}
                <div className="bg-black/50 border-2 border-primary/50 rounded-lg p-6 text-center space-y-4">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 border-4 border-primary/50 cursor-pointer transition-all hover:scale-105">
                        <AvatarImage 
                          src={selectedAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`} 
                          onClick={() => setShowAvatarSelector(true)}
                        />
                        <AvatarFallback className="text-2xl bg-primary/20 text-foreground">
                          {getUserInitials(name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Edit Avatar Button */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => setShowAvatarSelector(true)}
                      >
                        <Settings className="w-8 h-8 text-white" />
                      </div>
                      
                      <div 
                        className="absolute -bottom-2 -right-2 rounded-full p-1"
                        style={{ 
                          backgroundColor: userRank.color,
                          boxShadow: `0 0 10px ${userRank.color}`
                        }}
                      >
                        <userRank.icon className="w-6 h-6 text-black" />
                      </div>
                    </div>
                  </div>

                  {/* Avatar Selector Modal */}
                  {showAvatarSelector && (
                    <div 
                      className="fixed inset-0 z-[9999] flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)'
                      }}
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          setShowAvatarSelector(false);
                        }
                      }}
                    >
                      <div 
                        className="w-full max-w-2xl mx-4 bg-black/95 rounded-lg border-2 p-6"
                        style={{ 
                          borderColor: '#9d4edd',
                          boxShadow: '0 0 30px rgba(157, 78, 221, 0.5)',
                          backgroundColor: 'rgba(0, 0, 0, 0.95)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-white">Escolha seu Avatar</h3>
                          <Button
                            onClick={() => setShowAvatarSelector(false)}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-red-500/20"
                          >
                            ✕
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {avatarOptions.map((avatar) => (
                            <div
                              key={avatar.id}
                              className={`relative cursor-pointer group transition-all duration-200 ${
                                selectedAvatar === avatar.path 
                                  ? 'ring-2 ring-purple-500 scale-105' 
                                  : 'hover:scale-105'
                              }`}
                              onClick={() => setSelectedAvatar(avatar.path)}
                            >
                              <img
                                src={avatar.path}
                                alt={avatar.name}
                                className="w-full aspect-square object-cover rounded-lg border-2 border-gray-600 group-hover:border-purple-400"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 rounded-b-lg">
                                <p className="text-xs text-white text-center font-bold">{avatar.name}</p>
                              </div>
                              {selectedAvatar === avatar.path && (
                                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => setShowAvatarSelector(false)}
                            className="flex-1 rpg-button"
                          >
                            Confirmar Seleção
                          </Button>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* Character Info */}
                  <div className="space-y-2">
                    <h1 className="text-xl font-bold text-white">
                      {displayUser?.name || name || "Seu Nome"}
                    </h1>
                    <div 
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-full font-bold text-sm transition-all duration-300"
                      style={{ 
                        backgroundColor: userRank.bgColor,
                        border: `2px solid ${userRank.borderColor}`,
                        boxShadow: `0 0 15px ${userRank.borderColor}`,
                        color: userRank.color
                      }}
                    >
                      <userRank.icon className="w-4 h-4" style={{ color: userRank.color }} />
                      <span>{userRank.name}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <span className="text-2xl font-bold text-white number">{userLevel}</span>
                      <p className="text-xs text-white">LVL</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-2xl font-bold text-yellow-400 number">{userPoints}</span>
                      <p className="text-xs text-white">XP</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-2xl font-bold text-green-400 number">{displayUser?.completedExercises || 0}</span>
                      <p className="text-xs text-white">COMPLETADOS</p>
                    </div>
                  </div>

                  {/* XP Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white">Progresso para próximo nível</span>
                      <span className="text-white">{getProgressToNextLevel(userPoints).percentage}%</span>
                    </div>
                    <div 
                      className="w-full rounded-full h-3 overflow-hidden relative"
                      style={{ 
                        backgroundColor: 'rgba(75, 75, 75, 0.5)',
                        border: '1px solid rgba(157, 78, 221, 0.2)',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <div 
                        className="xp-bar h-full transition-all duration-1000 ease-out" 
                        style={{ 
                          width: `${getProgressToNextLevel(userPoints).percentage}%`,
                          background: `linear-gradient(90deg, ${userRank.color}88, ${userRank.color})`,
                          boxShadow: `0 0 10px ${userRank.color}66`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span style={{ color: userRank.color }}>{userPoints} XP</span>
                      <span className="text-white opacity-60">Próximo: {getProgressToNextLevel(userPoints).nextThreshold} XP</span>
                    </div>
                  </div>

                  {/* Description */}
                  {(displayUser?.description || description) && (
                    <div className="mt-4">
                      <p className="text-sm text-white italic">
                        "{displayUser?.description || description}"
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  {((displayUser?.github || github) || (displayUser?.linkedin || linkedin)) && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex justify-center space-x-4">
                        {(displayUser?.github || github) && (
                          <a
                            href={
                              (displayUser?.github || github).startsWith('http') 
                                ? (displayUser?.github || github)
                                : `https://github.com/${(displayUser?.github || github)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-xs text-gray-300 hover:text-purple-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span>GitHub</span>
                          </a>
                        )}
                        {(displayUser?.linkedin || linkedin) && (
                          <a
                            href={displayUser?.linkedin || linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlowCard>

          </div>
        </div>

        {/* Conquistas Section - Full Width */}
        <div className="mt-12">
          <GlowCard glowColor="orange" customSize={true} className="w-full">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Trophy className="w-8 h-8 text-orange-400" />
                <h2 className="text-3xl font-bold text-white">Conquistas</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {userPoints >= 10 && (
                  <div className="relative group min-h-[140px]">
                    <div className="relative flex flex-col justify-between h-full p-5 bg-black/90 rounded-lg border border-green-500/30 group-hover:border-green-400/50 transition-all duration-300" style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.3)' }}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-base text-white mb-1">Primeiro Passo</h4>
                          <p className="text-sm text-green-400">Ganhou seus primeiros <span className="font-bold">10 pontos</span></p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-400 to-emerald-600 h-2 rounded-full w-full"></div>
                        </div>
                        <span className="text-xs text-green-400 font-bold whitespace-nowrap">100%</span>
                      </div>
                    </div>
                  </div>
                )}

                {userPoints >= 50 && (
                  <div className="relative group min-h-[140px]">
                    <div className="relative flex flex-col justify-between h-full p-5 bg-black/90 rounded-lg border border-blue-500/30 group-hover:border-blue-400/50 transition-all duration-300" style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                            <Star className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-base text-white mb-1">Em Ascensão</h4>
                          <p className="text-sm text-blue-400">Alcançou <span className="font-bold">50 pontos</span> de experiência</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-400 to-cyan-600 h-2 rounded-full w-full"></div>
                        </div>
                        <span className="text-xs text-blue-400 font-bold whitespace-nowrap">100%</span>
                      </div>
                    </div>
                  </div>
                )}

                {userPoints >= 100 && (
                  <div className="relative group min-h-[140px]">
                    <div className="relative flex flex-col justify-between h-full p-5 bg-black/90 rounded-lg border border-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300" style={{ boxShadow: '0 0 8px rgba(147, 51, 234, 0.3)' }}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                            <Crown className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-base text-white mb-1">Centurião</h4>
                          <p className="text-sm text-purple-400">Conquistou <span className="font-bold">100 pontos</span></p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full w-full"></div>
                        </div>
                        <span className="text-xs text-purple-400 font-bold whitespace-nowrap">100%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conquistas Surpresas - Bloqueadas */}
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="relative group opacity-40 min-h-[140px] cursor-not-allowed">
                    <div className="relative flex flex-col justify-between h-full p-5 bg-black/50 rounded-lg border border-gray-600/30">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-lg text-gray-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>?</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-base text-gray-400 mb-1">???</h4>
                          <p className="text-sm text-gray-500">Conquista surpresa bloqueada</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gray-600 h-2 rounded-full w-0"></div>
                        </div>
                        <span className="text-xs text-gray-500 font-bold whitespace-nowrap">???</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}