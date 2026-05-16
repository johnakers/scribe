import Link from "next/link";
import { Button } from "../components/ui/button";
import { Database, FileJson, Gamepad2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 text-center">
      <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-6">
        <Gamepad2 className="mr-2 h-4 w-4" />
        <span>The Game Data Architect</span>
      </div>

      <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Scribe
      </h1>

      <p className="text-xl text-muted-foreground max-w-[42rem] mb-10 leading-normal">
        Design, manage, and export complex JSON databases for your video game projects.
        From item stats to dialogue trees, keep your game data structured and accessible.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg" className="px-8">
          <Link href="/projects">
            Go to Projects <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="px-8">
          Documentation
        </Button>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12 max-w-4xl">
        <div className="flex flex-col items-center p-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <FileJson className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">JSON Optimized</h3>
          <p className="text-sm text-muted-foreground">Tailored for modern game engines like Unity, Unreal, and Godot.</p>
        </div>
        <div className="flex flex-col items-center p-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Database Feel</h3>
          <p className="text-sm text-muted-foreground">Manage entries with a structured UI instead of wrestling with raw syntax.</p>
        </div>
      </div>
    </div>
  );
}