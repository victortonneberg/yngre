import type { LayoutProps } from "rwsdk/router";
import { requestInfo } from "rwsdk/worker";
import { AuthProvider } from "@/features/auth/components/AuthProvider";

export function AppLayout({ children }: LayoutProps) {
  const { ctx } = requestInfo;
  const { user } = ctx;

  return (
    <AuthProvider user={user}>
      <header className="site-header">
        <nav className="site-nav">
          <a href="/">Forside</a>

          <span className="site-nav__user" data-testid="logged-in-as">
            {user ? `${user.name} (${user.role})` : "Ikke innlogget"}
          </span>

          {user ? <a href="/profile">Profil</a> : null}

          {user ? (
            // Logg ut endrer tilstand, så det er et skjema med POST, ikke en lenke.
            <form method="post" action="/logout">
              <button type="submit" className="button">
                Logg ut
              </button>
            </form>
          ) : (
            <a href="/login">Logg inn</a>
          )}
        </nav>
      </header>

      {children}
    </AuthProvider>
  );
}
