import React, { useState } from "react";
import ProfilePage from "./pages/ProfilePage";
import CameraPage from "./pages/CameraPage";

type TabName = "profile" | "camera";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>("profile");

  const tabBarStyle: React.CSSProperties = {
    display: "flex",
    flexShrink: 0,
    backgroundColor: "#1e3a8a",
    borderTop: "2px solid #1e40af",
    // paddingBottom accounts for the iPhone home indicator safe area
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    border: "none",
    cursor: "pointer",
    backgroundColor: isActive ? "#2563eb" : "transparent",
    color: isActive ? "#ffffff" : "#93c5fd",
    fontSize: "14px",
    fontWeight: isActive ? "bold" : "normal",
    transition: "background-color 0.15s ease",
    // Fixed 72px tap target height — safe area padding is on the nav container
    height: "72px",
    padding: "0 4px",
    borderTop: isActive ? "3px solid #60a5fa" : "3px solid transparent",
    WebkitAppearance: "none",
    appearance: "none",
  });

  const iconStyle: React.CSSProperties = {
    fontSize: "28px",
    lineHeight: 1,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // 100dvh = dynamic viewport height, correct on iOS Safari (excludes browser chrome)
        // 100vh fallback for older browsers
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Page Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {activeTab === "profile" ? <ProfilePage /> : <CameraPage />}
      </div>

      {/* Bottom Tab Bar */}
      <nav style={tabBarStyle} aria-label="Navigation tabs">
        <button
          style={tabButtonStyle(activeTab === "profile")}
          onClick={() => setActiveTab("profile")}
          aria-selected={activeTab === "profile"}
          role="tab"
        >
          <span style={iconStyle} aria-hidden="true">
            👤
          </span>
          <span>My Info</span>
        </button>
        <button
          style={tabButtonStyle(activeTab === "camera")}
          onClick={() => setActiveTab("camera")}
          aria-selected={activeTab === "camera"}
          role="tab"
        >
          <span style={iconStyle} aria-hidden="true">
            📷
          </span>
          <span>Camera</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
