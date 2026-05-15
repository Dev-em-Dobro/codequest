import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import ExerciseDetail from "@/pages/exercise-detail";
import Categories from "@/pages/categories";
import NotFound from "@/pages/not-found";
import SignIn from "@/pages/auth/signin";
import SignUp from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";
import Profile from "@/pages/auth/profile";
import Exercises from "@/pages/exercises";
import SimpleExercise from "@/pages/simple-exercise";
import Ranking from "@/pages/ranking";
import Feedback from "@/pages/feedback";
import AddExercise from "@/pages/admin/add-exercise";
import { AuthContextProvider } from "./lib/simple-auth-client";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/exercise/:id" component={ExerciseDetail} />
      <Route path="/exercises/:category" component={Exercises} />
      <Route path="/ranking" component={Ranking} />
      <Route path="/auth/signin" component={SignIn} />
      <Route path="/auth/signup" component={SignUp} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/profile" component={Profile} />
      <Route path="/exercise" component={SimpleExercise} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/admin/add-exercise" component={AddExercise} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}

export default App;
