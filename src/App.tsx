import { HashRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./data/ProjectContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import MonteCarlo from "./pages/MonteCarlo";
import RiskAnalysis from "./pages/RiskAnalysis";
import ExpectedUtility from "./pages/ExpectedUtility";
import DecisionTheory from "./pages/DecisionTheory";
import Predictions from "./pages/Predictions";
import Geological from "./pages/Geological";
import Projects from "./pages/Projects";
import Financing from "./pages/Financing";
import VOIAnalysis from "./pages/VOIAnalysis";
import BayesianUpdating from "./pages/BayesianUpdating";
import ReliabilityAnalysis from "./pages/ReliabilityAnalysis";
import ReportDownload from "./pages/ReportDownload";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import PortfolioCompare from "./pages/PortfolioCompare";
import SensitivityAnalysis from "./pages/SensitivityAnalysis";
import CreateProject from "./pages/CreateProject";
import "./App.css";

function App() {
  return (
    <ProjectProvider>
    <HashRouter>
      <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monte-carlo" element={<MonteCarlo />} />
            <Route path="/risk-analysis" element={<RiskAnalysis />} />
            <Route path="/expected-utility" element={<ExpectedUtility />} />
            <Route path="/decision-theory" element={<DecisionTheory />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/geological" element={<Geological />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/financing" element={<Financing />} />
            <Route path="/voi-analysis" element={<VOIAnalysis />} />
            <Route path="/bayesian" element={<BayesianUpdating />} />
            <Route path="/reliability" element={<ReliabilityAnalysis />} />
            <Route path="/reports" element={<ReportDownload />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/portfolio" element={<PortfolioCompare />} />
            <Route path="/sensitivity" element={<SensitivityAnalysis />} />
            <Route path="/create-project" element={<CreateProject />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
    </ProjectProvider>
  );
}

export default App;
