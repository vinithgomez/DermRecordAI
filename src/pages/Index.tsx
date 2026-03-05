import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, LogOut } from "lucide-react";

export default function Index() {
  const { user, loading, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Heart className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-foreground">MedRecord AI</span>
        </div>
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Button asChild>
                <Link to="/dashboard">Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-1 h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
          <Heart className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          AI-Powered Patient Records
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Streamline diagnosis, manage patient data, and generate professional reports — all enhanced by intelligent AI summaries.
        </p>
        <div className="mt-8 flex gap-3">
          {user ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link to="/signup">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
