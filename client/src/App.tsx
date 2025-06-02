import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Home />
    </TooltipProvider>
  );
}

export default App;
