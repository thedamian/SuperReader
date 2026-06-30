import { Camera, ClipboardList, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { CameraPage } from "./CameraPage";
import { ProfilePage } from "./ProfilePage";
import { emptyProfile, loadProfile, saveProfile } from "./profile";
import type { Profile } from "./types";

type Page = "info" | "read";

export function App() {
  const [page, setPage] = useState<Page>("info");
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [savedMessage, setSavedMessage] = useState("");

  const completionCount = useMemo(
    () => Object.values(profile).filter((value) => value.trim().length > 0).length,
    [profile]
  );

  function updateProfile(next: Profile) {
    setProfile(next);
    setSavedMessage("");
  }

  function handleSave() {
    saveProfile(profile);
    setSavedMessage("Saved. Opening Reader.");
    window.setTimeout(() => setPage("read"), 450);
  }

  function handleClear() {
    setProfile(emptyProfile);
    saveProfile(emptyProfile);
    setSavedMessage("Cleared.");
  }

  return (
    <div className={`app-shell app-shell--${page}`}>
      <main className="app-main">
        {page === "info" ? (
          <ProfilePage
            profile={profile}
            completionCount={completionCount}
            savedMessage={savedMessage}
            onChange={updateProfile}
            onClear={handleClear}
            onSave={handleSave}
          />
        ) : (
          <CameraPage profile={profile} onOpenInfo={() => setPage("info")} />
        )}
      </main>

      <nav className="bottom-tabs" aria-label="Main navigation">
        <button
          className={page === "info" ? "tab-button tab-button--active" : "tab-button"}
          type="button"
          onClick={() => setPage("info")}
          aria-current={page === "info" ? "page" : undefined}
        >
          <ClipboardList aria-hidden="true" />
          <span>Info</span>
        </button>
        <button
          className={page === "read" ? "tab-button tab-button--active" : "tab-button"}
          type="button"
          onClick={() => setPage("read")}
          aria-current={page === "read" ? "page" : undefined}
        >
          <Camera aria-hidden="true" />
          <span>Read</span>
        </button>
      </nav>

      {page === "info" && (
        <button className="floating-save" type="button" onClick={handleSave}>
          <Save aria-hidden="true" />
          Save
        </button>
      )}
    </div>
  );
}
