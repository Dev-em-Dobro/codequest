import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { validationEngine } from "./validation-engine";
import { storage } from "./storage";
import { reviewExerciseCode, getExerciseHint } from "./openai-service";
import { updateCodeSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";


// Authentication middleware to get current user
async function getCurrentUser(req: any): Promise<string | null> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  // For now, return the token as user ID.
  // In production, you'd verify the JWT token here.
  return token || null;
}

// Authentication middleware - require auth for protected routes
async function requireAuth(req: any, res: any, next: any) {
  const userId = await getCurrentUser(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.userId = userId;
  next();
}

// Rate limiters for different endpoint types
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: { error: "Muitas tentativas de autenticação. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email validation needs a more permissive rate limit
const emailValidationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per minute
  message: { error: "Muitas tentativas de validação. Aguarde um momento e tente novamente." },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 100, // limit each IP to 100 AI requests per windowMs (suficiente para usuários ativos)
  message: { error: "Muitas requisições de IA. Tente novamente em alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip para localhost durante desenvolvimento (para não bloquear testes locais)
  skip: (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit admin operations
  message: { error: "Muitas operações administrativas. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Apply general rate limiting to all API routes
  app.use('/api/', generalLimiter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Neon backend is running" });
  });

  // Email validation endpoint - reads from Excel file
  app.post("/api/auth/validate-email", emailValidationLimiter, async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }


      const normalizedEmail = email.toLowerCase().trim();
      const webhookUrl = 'https://n8n.srv830193.hstgr.cloud/webhook/valida-email-codequest';
      let isValid = false;

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: normalizedEmail }),
        });
        console.log(response)
        if (response.ok) {
          const data = await response.json();
          console.log('data', data)
          if (data.status === '200') {
            isValid = true;
          }
        }
      } catch (webhookError) {
        console.error("Error calling webhook:", webhookError);
        // If webhook fails, we consider the email invalid
        isValid = false;
      }

      if (isValid) {
        // Check if user already exists in the database
        try {
          const existingUser = await storage.getUserByEmail(email);

          if (existingUser) {
            // User already has an account
            res.json({
              isValid: false,
              userExists: true,
              message: "Este email já possui uma conta cadastrada. Por favor, faça login."
            });
          } else {
            // Email is valid and user doesn't exist yet
            res.json({
              isValid: true,
              userExists: false,
              message: "Email válido! Complete o cadastro com nome e senha."
            });
          }
        } catch (dbError) {
          console.error("Error checking existing user:", dbError);
          // If database check fails, proceed with registration
          res.json({
            isValid: true,
            userExists: false,
            message: "Email válido! Complete o cadastro com nome e senha."
          });
        }
      } else {
        res.json({
          isValid: false,
          userExists: false,
          message: "Este email não está cadastrado em nossa base de dados. Se não lembra qual seu email do DevQuest, entre em contato com nosso suporte pelo WhatsApp."
        });
      }
    } catch (error) {
      console.error("Error validating email:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/sign-in", authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      res.json({
        sessionId: user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.totalPoints || 0,
          level: Math.floor((user.totalPoints || 0) / 100) + 1,
        },
      });
    } catch (error) {
      console.error("Sign-in error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/sign-up", authLimiter, async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Este email já está em uso" });
      }

      const user = await storage.createUser({
        name,
        email,
        totalPoints: 0,
        completedExercises: 0,
      });

      res.json({
        sessionId: user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.totalPoints || 0,
          level: Math.floor((user.totalPoints || 0) / 100) + 1,
        },
      });
    } catch (error) {
      console.error("Sign-up error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/sign-out", async (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/auth/session", async (req, res) => {
    try {
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Use PostgreSQL storage
      const user = await storage.getUser(userId);

      if (user) {
        res.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.totalPoints || 0,
            level: Math.floor((user.totalPoints || 0) / 100) + 1,
          }
        });
      } else {
        res.status(401).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Session error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/update-user", async (req, res) => {
    try {
      const { name, points, description, avatar, github, linkedin } = req.body;
      const userId = await getCurrentUser(req);

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Prepare update data
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (points !== undefined) updateData.totalPoints = points;
      if (description !== undefined) updateData.description = description;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (github !== undefined) updateData.github = github;
      if (linkedin !== undefined) updateData.linkedin = linkedin;

      const user = await storage.updateUser(userId, updateData);

      const responseData = {
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          description: user?.description,
          avatar: user?.avatar,
          github: user?.github,
          linkedin: user?.linkedin,
          points: user?.totalPoints || 0,
          level: Math.floor((user?.totalPoints || 0) / 100) + 1,
        },
        success: true,
      };

      res.json(responseData);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/feedbacks", requireAuth, async (req, res) => {
    try {
      const userId = req.userId as string;
      const { feedback } = req.body;

      if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
        return res.status(400).json({ error: "Feedback é obrigatório" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      await storage.createFeedback({
        feedback: feedback.trim(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
      });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get exercises with optional category filter
  app.get("/api/exercises", async (req, res) => {
    try {
      const { category, difficulty } = req.query;


      const exercises = await storage.getExercises();
      let filteredExercises = exercises;

      // Apply filters on server side
      if (category && category !== 'all') {
        filteredExercises = filteredExercises.filter(ex => ex.category === category);
      }

      if (difficulty && difficulty !== 'all') {
        filteredExercises = filteredExercises.filter(ex => ex.difficulty === difficulty);
      }

      res.json(filteredExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Get specific exercise
  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExercise(req.params.id);
      if (exercise) {
        return res.json(exercise);
      }
      return res.status(404).json({ message: "Exercise not found" });
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Get user progress for all exercises
  app.get("/api/progress", async (req, res) => {
    try {
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get progress for specific exercise
  app.get("/api/progress/:exerciseId", async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let progress = await storage.getExerciseProgress(userId, exerciseId);

      if (!progress) {
        const initialProgress = await storage.createUserProgress({
          id: `${userId}_${exerciseId}`,
          userId,
          exerciseId,
          completed: false,
          userCode: { html: "", css: "", javascript: "" },
          pointsEarned: 0,
          attempts: 0
        });
        return res.json(initialProgress);
      }
      res.json(progress);
    } catch (error) {
      console.error("Error fetching exercise progress:", error);
      res.status(500).json({ message: "Failed to fetch exercise progress" });
    }
  });

  // Save code for an exercise (called when user clicks "Executar")
  app.post("/api/code/save", async (req, res) => {
    try {
      const data = updateCodeSchema.parse(req.body);

      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const progress = await storage.updateCode(userId, data);
      return res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Failed to save code:", error);
      res.status(500).json({ message: "Failed to save code" });
    }
  });

  // Complete an exercise
  app.post("/api/exercises/:id/complete", async (req, res) => {
    try {
      const exerciseId = req.params.id;
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const exercise = await storage.getExercise(exerciseId);

      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const points = exercise.points || 10;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const progress = await storage.updateUserProgress(userId, exerciseId, {
        completed: true,
        pointsEarned: points
      });

      await storage.updateUser(userId, {
        totalPoints: (user.totalPoints || 0) + points,
        completedExercises: (user.completedExercises || 0) + 1
      });

      return res.json(progress);
    } catch (error) {
      console.error("Complete exercise error:", error);
      res.status(500).json({ message: "Failed to complete exercise" });
    }
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get users ranking - all users sorted by points
  app.get("/api/users/ranking", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();

      // Sort users by totalPoints (descending) and add rank
      const rankedUsers = allUsers
        .filter(user => user && user.id) // Filter out invalid users
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .map((user, index) => ({
          id: user.id,
          name: user.name || 'Usuário Anônimo',
          //email: user.email || '',
          avatar: user.avatar,
          totalPoints: user.totalPoints || 0,
          completedExercises: user.completedExercises || 0,
          github: user.github,
          linkedin: user.linkedin,
          rank: index + 1
        }));

      res.json(rankedUsers);
    } catch (error) {
      console.error("Error fetching users ranking:", error);
      res.status(500).json({ message: "Failed to fetch users ranking" });
    }
  });

  // Validate exercise code with smart validation
  app.post("/api/exercises/:id/validate", async (req, res) => {
    try {
      const exerciseId = req.params.id;
      const { userCode } = req.body;

      const exercise = await storage.getExercise(exerciseId);

      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // Use smart validation engine instead of simple rule matching
      const validationResults = await validationEngine.validateExercise(exercise, userCode);

      res.json(validationResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate exercise" });
    }
  });

  // OpenAI-powered code review
  app.post("/api/exercises/:id/ai-review", aiLimiter, async (req, res) => {
    try {
      const exerciseId = req.params.id;
      const { userCode } = req.body;

      // Get exercise details
      const exercise = await storage.getExercise(exerciseId);

      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // Use OpenAI to review the code
      const review = await reviewExerciseCode(
        userCode.html || "",
        userCode.css || "",
        userCode.javascript || "",
        exercise.title,
        exercise.description || "",
        exercise.instructions || ""
      );

      res.json(review);
    } catch (error) {
      console.error("AI review error:", error);
      res.status(500).json({
        feedback: "Desculpe, não foi possível analisar seu código no momento.",
        suggestions: ["Tente novamente em alguns instantes"],
        isCorrect: false,
        score: 0
      });
    }
  });

  // OpenAI-powered hints
  app.post("/api/exercises/:id/ai-hint", aiLimiter, async (req, res) => {
    try {
      const exerciseId = req.params.id;
      const { userCode } = req.body;

      // Get exercise details
      const exercise = await storage.getExercise(exerciseId);

      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // Use OpenAI to generate hint
      const hint = await getExerciseHint(
        userCode.html || "",
        userCode.css || "",
        userCode.javascript || "",
        exercise.title,
        exercise.instructions || ""
      );

      res.json({ hint });
    } catch (error) {
      console.error("AI hint error:", error);
      res.status(500).json({
        hint: "Tente revisar as instruções do exercício e continue experimentando!"
      });
    }
  });

  // Admin: Delete exercise
  app.delete("/api/admin/exercises/:id", adminLimiter, async (req, res) => {
    try {
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Não autorizado" });
      }

      const exerciseId = req.params.id;

      await storage.deleteExercise(exerciseId);
      res.json({ message: "Exercício removido com sucesso" });
    } catch (error) {
      console.error("Error deleting exercise:", error);
      res.status(500).json({ error: "Erro ao remover exercício" });
    }
  });

  // Admin: Create new exercise
  app.post("/api/admin/exercises", adminLimiter, async (req, res) => {
    try {
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: "Não autorizado" });
      }

      // Se o body veio como string, faz o parse aqui
      let exerciseData = req.body;
      if (typeof exerciseData === 'string') {
        try {

          exerciseData = JSON.parse(exerciseData);
        } catch (parseError) {
          return res.status(400).json({ error: "JSON inválido" });
        }
      }

      // Validate required fields
      const requiredFields = ['id', 'title', 'description', 'difficulty', 'category', 'points', 'instructions'];
      for (const field of requiredFields) {
        if (!exerciseData[field]) {
          return res.status(400).json({ error: `Campo obrigatório: ${field}` });
        }
      }

      const existingExercise = await storage.getExercise(exerciseData.id);
      if (existingExercise) {
        return res.status(400).json({ error: "Já existe um exercício com este ID" });
      }

      const newExercise = await storage.createExercise(exerciseData);

      res.status(201).json({
        message: "Exercício criado com sucesso",
        exercise: newExercise
      });
    } catch (error) {
      console.error("Error creating exercise:", error);
      res.status(500).json({ error: "Erro ao criar exercício" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
