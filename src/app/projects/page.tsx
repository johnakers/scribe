"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent
} from "../../components/ui/card";
import {
  Plus,
  Trash2,
  Edit2,
  FolderOpen,
  Search
} from "lucide-react";

// Custom Input component to resolve missing module error
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
}

export default function ProjectsIndex() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");

  // Initialize with some mock data or load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("scribe_projects");
      if (saved) {
        setProjects(JSON.parse(saved));
      } else {
        const initial = [
          { id: "1", name: "RPG Items", description: "Weapon and armor stats for Act 1", updatedAt: new Date().toLocaleDateString() }
        ];
        setProjects(initial);
        localStorage.setItem("scribe_projects", JSON.stringify(initial));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Set page title for projects index
  useEffect(() => {
    document.title = "Scribe | Projects";
  }, []);

  const saveToStorage = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem("scribe_projects", JSON.stringify(updated));
  };

  const handleAddOrUpdate = () => {
    if (!form.name) return;

    if (editingId) {
      const updated = projects.map(p =>
        p.id === editingId ? { ...p, ...form, name: form.name.trim().toLowerCase(), updatedAt: new Date().toLocaleDateString() } : p
      );
      saveToStorage(updated);
      setEditingId(null);
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        name: form.name.trim().toLowerCase(),
        description: form.description,
        updatedAt: new Date().toLocaleDateString()
      };
      saveToStorage([...projects, newProject]);
    }

    setForm({ name: "", description: "" });
    setIsAdding(false);
  };

  const deleteProject = (id: string) => {
    saveToStorage(projects.filter(p => p.id !== id));
  };

  const startEdit = (project: Project) => {
    setForm({ name: project.name, description: project.description });
    setEditingId(project.id);
    setIsAdding(true);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-10 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Create and manage your game data architectures.</p>
          </div>
          <Button onClick={() => { setIsAdding(true); setEditingId(null); setForm({name:"", description:""}); }}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isAdding && (
          <Card className="mb-10 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Project" : "Create New Project"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Project Name (e.g., Quest Log)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <Input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={handleAddOrUpdate}>{editingId ? "Save Changes" : "Create Project"}</Button>
            </CardFooter>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-heading">{project.name}</CardTitle>
                  <Link href={`/projects/${project.id}`}>
                    <FolderOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer" />
                  </Link>
                </div>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">{project.description || "No description provided."}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between pt-4 border-t">
                <span className="text-xs text-muted-foreground italic">Updated {project.updatedAt}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(project)} className="h-8 w-8">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteProject(project.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}