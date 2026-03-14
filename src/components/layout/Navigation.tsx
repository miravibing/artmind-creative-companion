import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CheckSquare, BookOpen, Smile, Sparkles, Trophy, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/habits", icon: CheckSquare, label: "Habits" },
  { path: "/resources", icon: BookOpen, label: "Learn" },
  { path: "/mood", icon: Smile, label: "Mood" },
  { path: "/prompt", icon: Sparkles, label: "Inspire" },
  { path: "/challenges", icon: Trophy, label: "Challenges" },
];

export function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">ArtMind</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "soft" : "ghost"}
                    size="sm"
                    className={cn("gap-2 transition-all duration-300", isActive && "shadow-soft")}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="hidden lg:block max-w-[120px] truncate">{user.user_metadata?.display_name || user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="gradient" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "animate-pulse-soft")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          {user ? (
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-medium">Sign Out</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                location.pathname === "/auth" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LogIn className="w-5 h-5" />
              <span className="text-xs font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
