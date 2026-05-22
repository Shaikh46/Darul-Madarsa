import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import { useLanguage, LangContext } from "@/lib/i18n";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import Teachers from "@/pages/Teachers";
import Attendance from "@/pages/Attendance";
import HifzProgress from "@/pages/HifzProgress";
import Results from "@/pages/Results";
import TeacherPortal from "@/pages/TeacherPortal";
import Fees from "@/pages/Fees";
import Expenses from "@/pages/Expenses";
import Salaries from "@/pages/Salaries";
import Donations from "@/pages/Donations";
import Islamic from "@/pages/Islamic";
import Communication from "@/pages/Communication";
import NoraniQaida from "@/pages/NoraniQaida";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/students" component={Students} />
        <Route path="/teachers" component={Teachers} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/hifz-progress" component={HifzProgress} />
        <Route path="/results" component={Results} />
        <Route path="/teacher-portal" component={TeacherPortal} />
        <Route path="/fees" component={Fees} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/salaries" component={Salaries} />
        <Route path="/donations" component={Donations} />
        <Route path="/norani-qaida" component={NoraniQaida} />
        <Route path="/islamic" component={Islamic} />
        <Route path="/communication" component={Communication} />
        <Route path="/" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const langValue = useLanguage();
  return (
    <LangContext.Provider value={langValue}>
      {children}
    </LangContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProviders>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AppProviders>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
