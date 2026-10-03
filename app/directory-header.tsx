import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DirectoryHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="directory-header">
      <div className="directory-header-inner">
        <Link href="/" className="wordmark-slot">
          <span className="wordmark-code mono-data">№ 001</span>
          <span className="wordmark">Cohort</span>
        </Link>

        <nav aria-label="Directory sections">
          <ul className="nav-tabs">
            <li>
              <Link href="/events" className="nav-tab">
                Events
              </Link>
            </li>
            <li>
              <Link href="/events/new" className="nav-tab">
                Host
              </Link>
            </li>
            <li>
              <Link href="/profile" className="nav-tab">
                Profile
              </Link>
            </li>
            <li>
              {user ? (
                <LogoutButton />
              ) : (
                <Link href="/login" className="nav-tab">
                  Log in
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
