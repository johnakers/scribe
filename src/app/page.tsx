import Link from "next/link";
import { Button } from "../components/ui/button";
import {
  Database,
  FileJson,
  Gamepad2,
  ArrowRight,
  Layers,
  Code2,
  Moon,
  Zap,
  CheckCircle2,
  GitBranch,
  Coffee
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-10 px-4 text-center overflow-hidden">
      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold mb-4 text-primary border border-primary/20">
        <Gamepad2 className="mr-2 h-3 w-3" />
        <span>The Game Data Architect</span>
      </div>

      <h1 className="text-5xl font-heading font-black tracking-tighter sm:text-7xl mb-2 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
        Scribe
      </h1>

      <div className="flex items-center justify-center gap-4 mb-6">
        <a
          href="https://github.com/johnakers/scribe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
          title="GitHub Repository"
        >
          <GitBranch className="h-5 w-5" />
        </a>
        <a
          href="https://ko-fi.com/john_akers"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
          title="Support on Ko-fi"
        >
          <Coffee className="h-5 w-5" />
        </a>
      </div>

      <p className="text-lg text-muted-foreground max-w-[40rem] mb-8 leading-relaxed">
        Design, manage, and export complex JSON databases for your video game projects.
        Keep your game data structured, relational, and ready for any engine.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        <Button asChild size="lg" className="px-8 h-12 text-md font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Link href="/projects">
            Start Building <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full">
        <FeatureCard
          icon={<FileJson className="h-5 w-5" />}
          title="JSON Optimized"
          description="Tailored for modern engines like Unity and Godot."
        />
        <FeatureCard
          icon={<Layers className="h-5 w-5" />}
          title="Relational Data"
          description="Link entries across tables with ease."
        />
        <FeatureCard
          icon={<Database className="h-5 w-5" />}
          title="Database Feel"
          description="Structured UI instead of raw syntax."
        />
        <FeatureCard
          icon={<Code2 className="h-5 w-5" />}
          title="Live Preview"
          description="Real-time structure with highlighting."
        />
        <FeatureCard
          icon={<Zap className="h-5 w-5" />}
          title="ID Strategies"
          description="Auto-increment, UUID, or Epoch IDs."
        />
        <FeatureCard
          icon={<Moon className="h-5 w-5" />}
          title="Dark Mode"
          description="A beautiful theme for developers."
        />
      </div>

      <div className="mt-12 pt-8 border-t w-full max-w-2xl">
        <div className="grid grid-cols-4 gap-4 opacity-40">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Type-Safe</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Local-First</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Responsive</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">MIT</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center p-4 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-md group text-center">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}