import { NavLink } from "react-router-dom";
import { Building2, CircleUserRound, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/employer", label: "Employer Portal", icon: Building2 },
  { to: "/candidate", label: "Candidate Workspace", icon: CircleUserRound },
];

/** Top navigation shell that routes between View A and View B. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Hexagon className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">ProReady</p>
            <p className="text-xs text-muted-foreground">
              Project-based talent validation
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
