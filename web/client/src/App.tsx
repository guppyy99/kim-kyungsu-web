import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import PledgeDB from "./pages/PledgeDB";
import DailySchedule from "./pages/DailySchedule";
import CitizenProposal from "./pages/CitizenProposal";
import PolicyLibrary from "./pages/PolicyLibrary";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminProposals from "./pages/admin/AdminProposals";
import AdminPolicy from "./pages/admin/AdminPolicy";
import AdminPledges from "./pages/admin/AdminPledges";
import AdminLogin from "./pages/AdminLogin";
import AdminAccount from "./pages/admin/AdminAccount";
import AnnouncementList from "./pages/AnnouncementList";
import AnnouncementDetail from "./pages/AnnouncementDetail";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route>
        <AdminLayout>
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/announcements" component={AdminAnnouncements} />
            <Route path="/admin/schedules" component={AdminSchedules} />
            <Route path="/admin/proposals" component={AdminProposals} />
            <Route path="/admin/policy" component={AdminPolicy} />
            <Route path="/admin/pledges" component={AdminPledges} />
            <Route path="/admin/account" component={AdminAccount} />
          </Switch>
        </AdminLayout>
      </Route>
    </Switch>
  );
}

function PublicRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/profile" component={Profile} />
        <Route path="/pledges" component={PledgeDB} />
        <Route path="/daily" component={DailySchedule} />
        <Route path="/proposals" component={CitizenProposal} />
        <Route path="/policy" component={PolicyLibrary} />
        <Route path="/announcements" component={AnnouncementList} />
        <Route path="/announcements/:id" component={AnnouncementDetail} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminRouter} />
      <Route path="/admin/:rest*" component={AdminRouter} />
      <Route component={PublicRouter} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
