import React, { useState } from "react";
import ProfilePage from "./pages/ProfilePage";
import CameraPage from "./pages/CameraPage";

type TabName = "profile" | "camera";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>("profile");

  const tabBarStyle: React.CSSProperties = {
    display: "flex",
    flexShrink: 0,
    height: "72px",
    backgroundColor: "#1e3a8a",
    borderTop: "2px solid #1e40af",
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
    fontSize: "13px",
    fontWeight: isActive ? "bold" : "normal",
    transition: "background-color 0.15s ease",
    padding: "8px 4px",
    borderTop: isActive ? "3px solid #60a5fa" : "3px solid transparent",
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
        height: "100vh",
        width: "100vw",
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
