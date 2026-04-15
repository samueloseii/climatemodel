import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { loadProjects, type GeoProject } from "./projectStore";

interface ProjectContextValue {
  projects: GeoProject[];
  selectedProject: GeoProject | null;
  selectedId: string;
  setSelectedId: (id: string) => void;
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextValue>({
  projects: [],
  selectedProject: null,
  selectedId: "",
  setSelectedId: () => {},
  refreshProjects: () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<GeoProject[]>(() => loadProjects());
  const [selectedId, setSelectedId] = useState(() => {
    const p = loadProjects();
    return p.length > 0 ? p[0].id : "";
  });

  const refreshProjects = () => {
    const p = loadProjects();
    setProjects(p);
    if (!p.find(pr => pr.id === selectedId) && p.length > 0) {
      setSelectedId(p[0].id);
    }
  };

  useEffect(() => {
    // Sync with localStorage changes
    const handler = () => refreshProjects();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [selectedId]);

  const selectedProject = projects.find(p => p.id === selectedId) || projects[0] || null;

  return (
    <ProjectContext.Provider value={{ projects, selectedProject, selectedId, setSelectedId, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}

export function ProjectSelector({ className = "" }: { className?: string }) {
  const { projects, selectedId, setSelectedId } = useProject();
  if (projects.length === 0) return null;
  return (
    <select
      className={`select-dark min-w-[240px] ${className}`}
      value={selectedId}
      onChange={e => setSelectedId(e.target.value)}
    >
      {projects.map(p => (
        <option key={p.id} value={p.id}>
          {p.name} ({p.country}) — {p.capacity_MW} MW
        </option>
      ))}
    </select>
  );
}
