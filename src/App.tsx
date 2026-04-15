import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import Projects from "./pages/Projects";
import DataRepository from "./pages/DataRepository";
import Financing from "./pages/Financing";
import Communications from "./pages/Communications";
import Reports from "./pages/Reports";
import Architecture from "./pages/Architecture";
import Settings from "./pages/Settings";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/data" element={<DataRepository />} />
            <Route path="/financing" element={<Financing />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
