"use client";

import React from "react";
import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Table as TableIcon,
  Save,
  Eye,
  EyeOff,
  Upload,
  PlusCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sun,
  Moon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from "lucide-react";

// Custom Input component
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={`flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'reference' | 'array' | 'json';
  arrayType?: 'string' | 'number' | 'boolean' | 'reference';
  referencedTableId?: string;
  nullable?: boolean;
}

interface TableSchema {
  id: string;
  name: string;
  columns: ColumnSchema[];
  rows: Record<string, string | number | boolean | any[] | null>[];
  idStrategy?: 'integer' | 'uuid' | 'epoch';
}

interface TableSortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  tables?: TableSchema[];
}

export default function ProjectShowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<'string' | 'number' | 'boolean' | 'reference' | 'array' | 'json'>('string');
  const [newArrayType, setNewArrayType] = useState<'string' | 'number' | 'boolean' | 'reference'>('string');
  const [referencedTableId, setReferencedTableId] = useState<string>("");
  const [newColumnNotNull, setNewColumnNotNull] = useState(false);

  const [isRenameColumnDialogOpen, setIsRenameColumnDialogOpen] = useState(false);
  const [renamingColumnName, setRenamingColumnName] = useState("");
  const [activeColumnIndex, setActiveColumnIndex] = useState<number | null>(null);

  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false);
  const [tableToDeleteId, setTableToDeleteId] = useState<string | null>(null);
  const [tableToDeleteName, setTableToDeleteName] = useState<string | null>(null);

  const [isDeleteColumnDialogOpen, setIsDeleteColumnDialogOpen] = useState(false);
  const [columnToDeleteIndex, setColumnToDeleteIndex] = useState<number | null>(null);
  const [columnToDeleteName, setColumnToDeleteName] = useState<string | null>(null);

  const [isDeleteRowDialogOpen, setIsDeleteRowDialogOpen] = useState(false);
  const [rowToDeleteIndex, setRowToDeleteIndex] = useState<number | null>(null);

  const [sortConfigs, setSortConfigs] = useState<Record<string, TableSortConfig>>({});
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [hiddenTables, setHiddenTables] = useState<Record<string, boolean>>({});

  const toggleHideTableRows = (tableId: string) => {
    setHiddenTables(prev => ({
      ...prev,
      [tableId]: !prev[tableId]
    }));
  };

  const [isRefSelectDialogOpen, setIsRefSelectDialogOpen] = useState(false);
  const [activeRefTableId, setActiveRefTableId] = useState<string | null>(null);
  const [activeRefRowIndex, setActiveRefRowIndex] = useState<number | null>(null);
  const [activeRefColName, setActiveRefColName] = useState<string | null>(null);
  const [activeRefTargetTableId, setActiveRefTargetTableId] = useState<string | null>(null);

  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableIdStrategy, setNewTableIdStrategy] = useState<'integer' | 'uuid' | 'epoch'>('integer');

  // Dark mode toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme as 'light' | 'dark');
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  // Load project from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("scribe_projects");
      if (saved) {
        const projects: Project[] = JSON.parse(saved);
        const found = projects.find((p) => p.id === slug);
        if (found) {
          // Migration for old data structures
          const migratedTables: TableSchema[] = (found.tables || []).map(t => ({
            ...t,
            idStrategy: t.idStrategy || 'epoch',
            columns: (t.columns as any[]).map(c =>
              typeof c === 'string' ? { name: c, type: 'string' as const } : c
            )
          }));
          setProject({ ...found, tables: migratedTables });
        }
      }
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [slug]);

  // Update page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Scribe | ${project.name}`;
    }
  }, [project?.name]);

  const updateProject = (updated: Project) => {
    const saved = localStorage.getItem("scribe_projects");
    if (saved) {
      const projects: Project[] = JSON.parse(saved);
      const newProjects = projects.map((p) =>
        p.id === updated.id ? { ...updated, updatedAt: new Date().toLocaleDateString() } : p
      );
      localStorage.setItem("scribe_projects", JSON.stringify(newProjects));
      setProject(updated);
    }
  };

  const updateTable = (id: string, updates: Partial<TableSchema>) => {
    if (!project) return;
    updateProject({
      ...project,
      tables: (project.tables || []).map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const openAddTableDialog = () => {
    setNewTableName(`table ${(project?.tables?.length || 0) + 1}`);
    setNewTableIdStrategy('integer');
    setIsAddTableDialogOpen(true);
  };

  const handleConfirmAddTable = () => {
    if (!project || !newTableName.trim()) return;

    const newTable: TableSchema = {
      id: Date.now().toString(),
      name: newTableName.trim().toLowerCase(),
      idStrategy: newTableIdStrategy,
      columns: [
        { name: "id", type: newTableIdStrategy === 'uuid' ? "string" : "number", nullable: false },
        { name: "name", type: "string" }
      ],
      rows: []
    };

    updateProject({ ...project, tables: [...(project.tables || []), newTable] });
    setIsAddTableDialogOpen(false);
  };

  const deleteTable = (id: string) => {
    const table = project?.tables?.find(t => t.id === id);
    if (table) {
      setTableToDeleteId(id);
      setTableToDeleteName(table.name);
      setIsDeleteTableDialogOpen(true);
    }
  };

  const handleConfirmDeleteTable = () => {
    if (!project || !tableToDeleteId) return;
    updateProject({
      ...project,
      tables: (project.tables || []).filter(t => t.id !== tableToDeleteId)
    });
    setIsDeleteTableDialogOpen(false);
    setTableToDeleteId(null);
  };

  const addColumn = (tableId: string) => {
    setActiveTableId(tableId);
    setNewColumnName("");
    setNewColumnType('string');
    setReferencedTableId("");
    setNewColumnNotNull(false);
    setIsColumnDialogOpen(true);
  };

  const handleConfirmAddColumn = () => {
    if (!newColumnName || !project || !activeTableId) return;
    const table = project.tables?.find(t => t.id === activeTableId);
    if (!table) return;

    const newCol: ColumnSchema = {
      name: newColumnName.trim().toLowerCase(),
      type: newColumnType,
      arrayType: newColumnType === 'array' ? newArrayType : undefined,
      referencedTableId: (newColumnType === 'reference' || (newColumnType === 'array' && newArrayType === 'reference')) ? referencedTableId : undefined,
      nullable: !newColumnNotNull
    };

    updateTable(activeTableId, { columns: [...table.columns, newCol] });
    setIsColumnDialogOpen(false);
  };

  const deleteColumn = (tableId: string, colIndex: number) => {
    const table = project?.tables?.find(t => t.id === tableId);
    if (!table) return;

    setActiveTableId(tableId);
    setColumnToDeleteIndex(colIndex);
    setColumnToDeleteName(table.columns[colIndex].name);
    setIsDeleteColumnDialogOpen(true);
  };

  const handleConfirmDeleteColumn = () => {
    if (!activeTableId || columnToDeleteIndex === null || !project) return;
    const table = project.tables?.find(t => t.id === activeTableId);
    if (!table) return;

    const colName = table.columns[columnToDeleteIndex].name;
    const newColumns = table.columns.filter((_, i) => i !== columnToDeleteIndex);
    const newRows = table.rows.map(row => {
      const newRow = { ...row };
      delete newRow[colName];
      return newRow;
    });

    updateTable(activeTableId, { columns: newColumns, rows: newRows });
    setIsDeleteColumnDialogOpen(false);
    setColumnToDeleteIndex(null);
    setColumnToDeleteName(null);
  };

  const deleteRow = (tableId: string, rowIndex: number) => {
    setActiveTableId(tableId);
    setRowToDeleteIndex(rowIndex);
    setIsDeleteRowDialogOpen(true);
  };

  const handleConfirmDeleteRow = () => {
    if (!activeTableId || rowToDeleteIndex === null || !project) return;
    const table = project.tables?.find(t => t.id === activeTableId);
    if (!table) return;

    const newRows = table.rows.filter((_, i) => i !== rowToDeleteIndex);
    updateTable(activeTableId, { rows: newRows });
    setIsDeleteRowDialogOpen(false);
    setRowToDeleteIndex(null);
  };

  const openReferenceSelect = (tableId: string, rowIndex: number, colName: string, targetTableId: string) => {
    setActiveRefTableId(tableId);
    setActiveRefRowIndex(rowIndex);
    setActiveRefColName(colName);
    setActiveRefTargetTableId(targetTableId);
    setIsRefSelectDialogOpen(true);
  };

  const handleSelectReference = (value: string | number) => {
    if (!activeRefTableId || activeRefRowIndex === null || !activeRefColName) return;
    const table = project?.tables?.find(t => t.id === activeRefTableId);
    if (!table) return;

    const newRows = [...table.rows];
    newRows[activeRefRowIndex] = { ...newRows[activeRefRowIndex], [activeRefColName]: value };
    updateTable(activeRefTableId, { rows: newRows });
    setIsRefSelectDialogOpen(false);
    
    setActiveRefTableId(null);
    setActiveRefRowIndex(null);
    setActiveRefColName(null);
    setActiveRefTargetTableId(null);
  };

  const getTableSortConfig = (table: TableSchema) => {
    const config = sortConfigs[table.id];
    if (config && table.columns.some(col => col.name === config.column)) {
      return config;
    }
    // Default to 'id' asc if it exists
    const hasId = table.columns.some(col => col.name.toLowerCase() === 'id');
    if (hasId) {
      return { column: 'id', direction: 'asc' as const };
    }
    // Fallback to first column
    if (table.columns.length > 0) {
      return { column: table.columns[0].name, direction: 'asc' as const };
    }
    return null;
  };

  const toggleSort = (tableId: string, columnName: string) => {
    setSortConfigs(prev => {
      const table = project?.tables?.find(t => t.id === tableId);
      if (!table) return prev;
      
      const current = getTableSortConfig(table);
      if (current && current.column === columnName) {
        return {
          ...prev,
          [tableId]: {
            column: columnName,
            direction: current.direction === 'asc' ? 'desc' : 'asc'
          }
        };
      } else {
        return {
          ...prev,
          [tableId]: {
            column: columnName,
            direction: 'asc'
          }
        };
      }
    });
  };

  const getSortedRowsWithIndices = (table: TableSchema) => {
    const sortConfig = getTableSortConfig(table);
    const rowsWithIndices = table.rows.map((row, index) => ({ row, index }));
    
    if (!sortConfig) return rowsWithIndices;
    
    const { column: sortKey, direction } = sortConfig;
    const colSpec = table.columns.find(col => col.name === sortKey);
    const columnType = colSpec?.type;

    rowsWithIndices.sort((a, b) => {
      const valA = a.row[sortKey];
      const valB = b.row[sortKey];

      if (valA === undefined || valA === null) return direction === 'asc' ? 1 : -1;
      if (valB === undefined || valB === null) return direction === 'asc' ? -1 : 1;

      if (columnType === 'number') {
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return direction === 'asc' ? numA - numB : numB - numA;
        }
      }

      const strA = (columnType === 'json' || Array.isArray(valA) || (typeof valA === 'object' && valA !== null))
        ? JSON.stringify(valA).toLowerCase()
        : String(valA).toLowerCase();
      const strB = (columnType === 'json' || Array.isArray(valB) || (typeof valB === 'object' && valB !== null))
        ? JSON.stringify(valB).toLowerCase()
        : String(valB).toLowerCase();
      if (strA < strB) return direction === 'asc' ? -1 : 1;
      if (strA > strB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return rowsWithIndices;
  };

  const moveColumn = (tableId: string, index: number, direction: 'left' | 'right') => {
    const table = project?.tables?.find(t => t.id === tableId);
    if (!table) return;
    const newCols = [...table.columns];
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= newCols.length) return;
    const [moved] = newCols.splice(index, 1);
    newCols.splice(target, 0, moved);
    updateTable(tableId, { columns: newCols });
  };

  const openRenameColumnDialog = (tableId: string, index: number) => {
    const table = project?.tables?.find(t => t.id === tableId);
    if (!table) return;
    setActiveTableId(tableId);
    setActiveColumnIndex(index);
    setRenamingColumnName(table.columns[index].name);
    setIsRenameColumnDialogOpen(true);
  };

  const handleConfirmRenameColumn = () => {
    if (!activeTableId || activeColumnIndex === null || !project) return;
    const table = project.tables?.find(t => t.id === activeTableId);
    if (!table) return;

    const oldName = table.columns[activeColumnIndex].name;
    const newName = renamingColumnName.trim().toLowerCase();
    const newCols = [...table.columns];
    newCols[activeColumnIndex] = { ...newCols[activeColumnIndex], name: newName };

    const newRows = table.rows.map(row => {
      const newRow = { ...row };
      if (oldName in newRow) {
        newRow[newName] = newRow[oldName];
        delete newRow[oldName];
      }
      return newRow;
    });

    updateTable(activeTableId, { columns: newCols, rows: newRows });
    setIsRenameColumnDialogOpen(false);
  };

  const addRow = (tableId: string) => {
    const table = project?.tables?.find(t => t.id === tableId);
    if (!table) return;

    const idColumn = table.columns.find(col => col.name.toLowerCase() === 'id');
    let idValue: any = null;

    if (idColumn) {
      switch (table.idStrategy || 'epoch') {
        case 'integer':
          idValue = table.rows.length + 1;
          break;
        case 'uuid':
          idValue = crypto.randomUUID();
          break;
        case 'epoch':
        default:
          idValue = Date.now();
          break;
      }
    }

    const newRow = idColumn ? { [idColumn.name]: idValue } : {};
    updateTable(tableId, { rows: [...table.rows, newRow] });
  };

  const handleSaveJson = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedProject = JSON.parse(content) as Project;

        if (!importedProject.name) {
          alert("Invalid JSON: Project name is missing.");
          return;
        }

        const migratedTables: TableSchema[] = (importedProject.tables || []).map(t => ({
          ...t,
          columns: ((t.columns || []) as any[]).map(c =>
            typeof c === 'string' ? { name: c, type: 'string' as const } : c
          )
        }));

        updateProject({
          ...importedProject,
          tables: migratedTables,
          id: slug,
          updatedAt: new Date().toLocaleDateString()
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleCopyJson = () => {
    if (!project) return;
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const getHighlightedJson = () => {
    if (!project) return "";
    const json = JSON.stringify(project, null, 2);
    const escaped = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-blue-600 dark:text-blue-400"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-purple-600 dark:text-purple-400 font-semibold"; // key
          } else {
            cls = "text-emerald-600 dark:text-emerald-400"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-amber-600 dark:text-amber-400"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-slate-400 dark:text-slate-500"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  if (loading) return null;
  if (!project) return <div className="p-20 text-center text-xl font-medium">Project not found.</div>;

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="w-full px-4 sm:px-8 py-10">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" asChild className="-ml-2 text-muted-foreground hover:text-primary">
              <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsChangelogOpen(true)}
                className="text-muted-foreground hover:text-primary"
              >
                Changelog
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-primary"
              >
                {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pt-4 pb-12">
            <div>
              <h1 className="text-5xl font-heading font-extrabold tracking-tight mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" style={{ minHeight: "60px" }}>
                {project.name}
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl">{project.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                variant="outline"
                size="lg"
                className="h-12 px-6 font-semibold shadow-lg"
              >
                {showJsonPreview ? <EyeOff className="mr-2 h-5 w-5" /> : <Eye className="mr-2 h-5 w-5" />}
                {showJsonPreview ? "Show Tables" : "Preview JSON"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleLoadJson}
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg" className="h-12 px-6 font-semibold shadow-lg">
                <Upload className="mr-2 h-5 w-5" /> Load JSON
              </Button>
              <Button onClick={handleSaveJson} variant="outline" size="lg" className="h-12 px-6 font-semibold shadow-lg">
                <Save className="mr-2 h-5 w-5" /> Save JSON
              </Button>
              <Button onClick={openAddTableDialog} size="lg" className="h-12 px-6 font-semibold shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> Add Table
              </Button>
            </div>
          </div>
        </div>

        {showJsonPreview ? (
          <Card className="border-2 shadow-sm bg-card relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 hover:bg-muted"
              onClick={handleCopyJson}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <pre
              className="p-6 text-sm font-mono overflow-auto max-h-[70vh] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: getHighlightedJson() }}
            />
          </Card>
        ) : (
          <div className="grid gap-16">
            {project.tables?.map((table) => (
              <div key={table.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <TableIcon className="h-6 w-6 text-primary" />
                    <Input
                      className="h-10 w-full bg-transparent font-bold text-2xl border-none focus-visible:ring-0 px-0 hover:bg-muted/50 rounded-none truncate font-heading"
                      value={table.name}
                      onChange={(e) => updateTable(table.id, { name: e.target.value.toLowerCase() })}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Button variant="outline" size="sm" onClick={() => addColumn(table.id)} className="h-9">
                      <PlusCircle className="mr-2 h-4 w-4" /> Column
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addRow(table.id)} className="h-9">
                      <PlusCircle className="mr-2 h-4 w-4" /> Row
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleHideTableRows(table.id)}
                      className="text-muted-foreground h-9 w-9 hover:bg-muted"
                      title={hiddenTables[table.id] ? "Show rows" : "Hide rows"}
                    >
                      {hiddenTables[table.id] ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive h-9 w-9 hover:bg-destructive/10" onClick={() => deleteTable(table.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-none border-2 shadow-sm overflow-hidden bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse table-auto min-w-full">
                      <thead className="bg-muted/70 text-muted-foreground border-b-2">
                        <tr>
                          {table.columns.map((col, i) => (
                            <th
                              key={i}
                              className={`px-6 py-4 border-r last:border-r-0 font-bold uppercase text-xs tracking-widest group/header ${
                                col.name.toLowerCase() === 'id' ? 'w-24 min-w-[96px]' : 'min-w-[150px]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col overflow-hidden">
                                  <div
                                    className="flex items-center gap-1.5 cursor-pointer select-none hover:text-foreground transition-colors overflow-hidden"
                                    onClick={() => toggleSort(table.id, col.name)}
                                  >
                                    <span className="truncate">
                                      {col.name}
                                      {col.nullable !== false && <span className="text-muted-foreground ml-0.5 font-normal">?</span>}
                                    </span>
                                    {(() => {
                                      const sortConfig = getTableSortConfig(table);
                                      if (sortConfig && sortConfig.column === col.name) {
                                        return sortConfig.direction === 'asc' ? (
                                          <ArrowUp className="h-3.5 w-3.5 text-primary shrink-0" />
                                        ) : (
                                          <ArrowDown className="h-3.5 w-3.5 text-primary shrink-0" />
                                        );
                                      }
                                      return (
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/30 group-hover/header:text-muted-foreground/60 shrink-0 transition-colors" />
                                      );
                                    })()}
                                  </div>
                                  {(col.type === 'reference' || (col.type === 'array' && col.arrayType === 'reference')) && (
                                    <span className="text-[10px] text-primary lowercase font-normal truncate">
                                      {col.type === 'array' ? `array<${project.tables?.find(t => t.id === col.referencedTableId)?.name || col.arrayType}>` : `ref: ${project.tables?.find(t => t.id === col.referencedTableId)?.name}`}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => moveColumn(table.id, i, 'left')} disabled={i === 0}>
                                    <ChevronLeft className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => moveColumn(table.id, i, 'right')} disabled={i === table.columns.length - 1}>
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => openRenameColumnDialog(table.id, i)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteColumn(table.id, i)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </th>
                          ))}
                          <th className="px-6 py-4 text-center w-28 min-w-[112px] font-bold uppercase text-xs tracking-widest last:border-r-0">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {!hiddenTables[table.id] && getSortedRowsWithIndices(table).map(({ row, index: originalIndex }) => (
                          <tr key={originalIndex} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                            {table.columns.map((col, colIndex) => {
                              const val = row[col.name];
                              const isInvalid = col.nullable === false && (val === undefined || val === null || val === "");
                              return (
                                <td
                                  key={colIndex}
                                  className={`px-6 py-3 border-r last:border-r-0 relative transition-colors duration-300 ${
                                    isInvalid ? 'bg-destructive/10 border-destructive/20 animate-fade-in' : ''
                                  }`}
                                >
                                  {col.type === 'reference' ? (
                                    (() => {
                                      const targetTable = project.tables?.find(t => t.id === col.referencedTableId);
                                      const referencedRow = targetTable?.rows.find(refRow => {
                                        const refVal = typeof refRow.id === 'number' ? refRow.id : String(refRow.id ?? refRow.name ?? "");
                                        return String(refVal) === String(val);
                                      });
                                      const label = referencedRow ? String(referencedRow.name ?? referencedRow.id ?? "Selected Row") : "— Select Ref —";
                                      return (
                                        <button
                                          onClick={() => openReferenceSelect(table.id, originalIndex, col.name, col.referencedTableId || "")}
                                          className="w-full h-8 text-left bg-transparent hover:bg-muted/40 transition-colors px-0 flex items-center justify-between text-sm select-none border border-transparent rounded-none group/cell animate-fade-in"
                                        >
                                          <span className={referencedRow ? "text-foreground truncate" : "text-muted-foreground/40 truncate"}>
                                            {label}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground/30 opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap pl-1 pr-1 shrink-0">
                                            Edit
                                          </span>
                                        </button>
                                      );
                                    })()
                                  ) : col.type === 'boolean' ? (
                                    <Select
                                      className="h-8 border-none bg-transparent px-0 focus-visible:ring-0"
                                      value={(row[col.name] === true ? "true" : row[col.name] === false ? "false" : "") as string}
                                      onChange={(e) => {
                                        const newRows = [...table.rows];
                                        let v: any = e.target.value;
                                        if (v === "true") v = true;
                                        else if (v === "false") v = false;
                                        else v = "";
                                        newRows[originalIndex] = { ...newRows[originalIndex], [col.name]: v };
                                        updateTable(table.id, { rows: newRows });
                                      }}
                                    >
                                      <option value="" className="bg-popover text-foreground">—</option>
                                      <option value="true" className="bg-popover text-foreground">True</option>
                                      <option value="false" className="bg-popover text-foreground">False</option>
                                    </Select>
                                  ) : col.type === 'array' ? (
                                    <input
                                      className="w-full bg-transparent focus:outline-none placeholder:text-muted-foreground/30 font-mono text-xs"
                                      value={(Array.isArray(row[col.name]) ? JSON.stringify(row[col.name]) : String(row[col.name] ?? "")) as string}
                                      onChange={(e) => {
                                        const newRows = [...table.rows];
                                        let v: string | any[] = e.target.value;
                                        try {
                                          if (v.trim().startsWith('[') && v.trim().endsWith(']')) v = JSON.parse(v);
                                        } catch {
                                        }
                                        newRows[originalIndex] = { ...newRows[originalIndex], [col.name]: v };
                                        updateTable(table.id, { rows: newRows });
                                      }}
                                      placeholder="[]"
                                    />
                                  ) : col.type === 'json' ? (
                                    <input
                                      className="w-full bg-transparent focus:outline-none placeholder:text-muted-foreground/30 font-mono text-xs"
                                      value={(typeof row[col.name] === 'object' && row[col.name] !== null ? JSON.stringify(row[col.name]) : String(row[col.name] ?? "")) as string}
                                      onChange={(e) => {
                                        const newRows = [...table.rows];
                                        let v: any = e.target.value;
                                        try {
                                          const trimmed = v.trim();
                                          if (trimmed === "") {
                                            v = null;
                                          } else {
                                            v = JSON.parse(trimmed);
                                          }
                                        } catch {
                                        }
                                        newRows[originalIndex] = { ...newRows[originalIndex], [col.name]: v };
                                        updateTable(table.id, { rows: newRows });
                                      }}
                                      placeholder="{}"
                                    />
                                  ) : (
                                    <input
                                      type={col.type === 'number' ? 'number' : 'text'}
                                      className="w-full bg-transparent focus:outline-none placeholder:text-muted-foreground/30"
                                      value={(typeof row[col.name] === 'number' ? row[col.name] : (Array.isArray(row[col.name]) ? JSON.stringify(row[col.name]) : String(row[col.name] ?? ""))) as string | number}
                                      onChange={(e) => {
                                        const newRows = [...table.rows];
                                        const v = col.type === 'number' && e.target.value !== "" ? Number(e.target.value) : e.target.value;
                                        newRows[originalIndex] = { ...newRows[originalIndex], [col.name]: v };
                                        updateTable(table.id, { rows: newRows });
                                      }}
                                      placeholder="..."
                                    />
                                  )}
                                  {isInvalid && (
                                    <div className="absolute top-0.5 right-1 text-[9px] font-semibold text-destructive/80 pointer-events-none select-none tracking-wider uppercase animate-pulse">
                                      invalid
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-6 py-3 text-center border-r last:border-r-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-8 w-8 hover:bg-destructive/10"
                                onClick={() => deleteRow(table.id, originalIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Create a new data table for your project. Choose an ID generation strategy.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Table Name</Label>
              <Input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>ID Generation Strategy</Label>
              <Select value={newTableIdStrategy} onChange={(e) => setNewTableIdStrategy(e.target.value as any)}>
                <option value="integer">Integer (Auto-increment)</option>
                <option value="uuid">UUID (Universal ID)</option>
                <option value="epoch">Epoch (Timestamp)</option>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleConfirmAddTable}>Create Table</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
            <DialogDescription>
              Define a new data column. Specify the name and data type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Column Name</Label>
              <Input value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={newColumnType} onChange={(e) => setNewColumnType(e.target.value as any)}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="reference">Reference</option>
                <option value="json">JSON</option>
              </Select>
            </div>
            {newColumnType === 'array' && (
              <div className="grid gap-2">
                <Label>Array Element Type</Label>
                <Select value={newArrayType} onChange={(e) => setNewArrayType(e.target.value as any)}>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="reference">Reference</option>
                </Select>
              </div>
            )}
            {(newColumnType === 'reference' || (newColumnType === 'array' && newArrayType === 'reference')) && (
              <div className="grid gap-2">
                <Label>Reference Table</Label>
                <Select value={referencedTableId} onChange={(e) => setReferencedTableId(e.target.value)}>
                  <option value="">Select table...</option>
                  {project.tables?.filter(t => t.id !== activeTableId).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2 py-1">
              <input
                id="not-null-checkbox"
                type="checkbox"
                className="h-4 w-4 rounded-none border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring accent-primary cursor-pointer"
                checked={newColumnNotNull}
                onChange={(e) => setNewColumnNotNull(e.target.checked)}
              />
              <Label htmlFor="not-null-checkbox" className="cursor-pointer select-none">Not Null</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={handleConfirmAddColumn}>Add Column</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameColumnDialogOpen} onOpenChange={setIsRenameColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
            <DialogDescription>
              Enter a new name for this column.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input value={renamingColumnName} onChange={(e) => setRenamingColumnName(e.target.value)} autoFocus />
          </div>
          <DialogFooter><Button onClick={handleConfirmRenameColumn}>Rename</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteTableDialogOpen} onOpenChange={setIsDeleteTableDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Table: {tableToDeleteName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this table? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTableDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteTable}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteColumnDialogOpen} onOpenChange={setIsDeleteColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Column: {columnToDeleteName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this column and all its data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteColumnDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteColumn}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteRowDialogOpen} onOpenChange={setIsDeleteRowDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Row</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this row? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteRowDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteRow}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangelogOpen} onOpenChange={setIsChangelogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Scribe Changelog</DialogTitle>
            <DialogDescription>
              Recent updates and improvements to the Scribe editor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-primary">v1.1.0</h4>
                <span className="text-xs text-muted-foreground">June 2026</span>
              </div>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                <li>Upgraded reference selections from basic dropdown elements to custom dialog selection modals.</li>
                <li>Added ability to collapse/hide table rows via a toggle button next to row/column actions.</li>
                <li>Added interactive column headers to sort table rows presentationally, preserving original unsorted JSON values in file saves and preview tabs.</li>
                <li>Added support for deleting individual table rows, backed by a confirmation dialog to prevent accidental data loss.</li>
              </ul>
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-primary">v1.0.0</h4>
                <span className="text-xs text-muted-foreground">Core Release</span>
              </div>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                <li>Introduced relational tables with dynamic column types (string, number, boolean, array, reference).</li>
                <li>Multiple ID generation strategies: Integer, UUID, and Epoch.</li>
                <li>Live syntax-highlighted JSON schema preview.</li>
                <li>JSON import and export functionality.</li>
                <li>Dark/Light mode support.</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRefSelectDialogOpen} onOpenChange={setIsRefSelectDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Select Reference</DialogTitle>
            <DialogDescription>
              Select a row from the referenced table <strong>{project.tables?.find(t => t.id === activeRefTargetTableId)?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto pr-2">
            <button
              onClick={() => handleSelectReference("")}
              className="w-full text-left px-4 py-3 hover:bg-muted border border-transparent hover:border-input transition-all flex items-center justify-between group rounded-none"
            >
              <span className="text-muted-foreground font-medium">— Clear Reference —</span>
            </button>
            {project.tables?.find(t => t.id === activeRefTargetTableId)?.rows.map((refRow, idx) => {
              const val = typeof refRow.id === 'number' ? refRow.id : String(refRow.id ?? refRow.name ?? idx);
              const label = String(refRow.name ?? refRow.id ?? `Row ${idx + 1}`);
              const isSelected = String(val) === String(
                activeRefTableId && activeRefRowIndex !== null && activeRefColName
                  ? project.tables?.find(t => t.id === activeRefTableId)?.rows[activeRefRowIndex]?.[activeRefColName] ?? ""
                  : ""
              );
              
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectReference(val)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted border transition-all flex items-center justify-between group rounded-none ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-input'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                      ID: {String(refRow.id ?? idx)}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-primary font-bold text-xs">Selected</span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}