
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import ImageQuiz from "./pages/ImageQuiz";
import YouTubeQuiz from "./pages/YouTubeQuiz";
import PDFQuiz from "./pages/PDFQuiz";
import TextQuiz from "./pages/TextQuiz";
import PromptQuiz from "./pages/PromptQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="image-quiz" element={<ImageQuiz />} />
            <Route path="youtube-quiz" element={<YouTubeQuiz />} />
            <Route path="pdf-quiz" element={<PDFQuiz />} />
            <Route path="text-quiz" element={<TextQuiz />} />
            <Route path="prompt-quiz" element={<PromptQuiz />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
