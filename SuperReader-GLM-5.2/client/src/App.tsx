import { useEffect, useState } from "react";
import { InfoPage } from "./pages/InfoPage";
import { ReadPage } from "./pages/ReadPage";
import { loadProfile, type UserProfile } from "./profile";

export type Tab = "info" | "read";

export function App() {
  const [tab, setTab] = useState<Tab>("info");
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  useEffect(() => {
    if (tab !== "info") return;
    setProfile(loadProfile());
  }, [tab]);

  return (
    <div className="app">
      <div className={"page" + (tab === "read" ? " page--fixed" : "")}>
        {tab === "info" ? (
          <InfoPage profile={profile} onSaved={() => setTab("read")} />
        ) : (
          <ReadPage profile={profile} />
        )}
      </div>
      <nav className="bottom-nav">
        <button
          className={tab === "info" ? "active" : ""}
          onClick={() => setTab("info")}
        >
          Info
        </button>
        <button
          className={tab === "read" ? "active" : ""}
          onClick={() => setTab("read")}
        >
          Read
        </button>
      </nav>
    </div>
  );
}
