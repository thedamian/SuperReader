import React, { useState, useEffect } from "react";
import {
  PersonalData,
  DEFAULT_PERSONAL_DATA,
  PERSONAL_DATA_LABELS,
  STORAGE_KEY,
} from "../types";

const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState<PersonalData>(DEFAULT_PERSONAL_DATA);
  const [saved, setSaved] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PersonalData;
        setFormData({ ...DEFAULT_PERSONAL_DATA, ...parsed });
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleChange = (field: keyof PersonalData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setSaved(true);
    // Reset saved indicator after 2 seconds
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm("Clear all your saved information?")) {
      setFormData(DEFAULT_PERSONAL_DATA);
      localStorage.removeItem(STORAGE_KEY);
      setSaved(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    height: "100%",
    overflowY: "auto",
    backgroundColor: "#f0f4ff",
    WebkitOverflowScrolling: "touch",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "16px 20px",
    textAlign: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  };

  const contentStyle: React.CSSProperties = {
    padding: "16px",
    maxWidth: "600px",
    margin: "0 auto",
    paddingBottom: "24px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "20px",
    border: "2px solid #93c5fd",
    borderRadius: "10px",
    backgroundColor: "white",
    color: "#1e293b",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: "18px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1e40af",
    borderBottom: "2px solid #bfdbfe",
    paddingBottom: "8px",
    marginBottom: "16px",
    marginTop: "24px",
  };

  const saveButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "18px",
    fontSize: "22px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: saved ? "#16a34a" : "#2563eb",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "8px",
    marginBottom: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
  };

  const clearButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    color: "#dc2626",
    backgroundColor: "white",
    border: "2px solid #dc2626",
    borderRadius: "12px",
    cursor: "pointer",
  };

  const twoColumnStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  };

  const renderField = (
    key: keyof PersonalData,
    type: string = "text",
    placeholder?: string
  ) => (
    <div key={key} style={fieldGroupStyle}>
      <label htmlFor={key} style={labelStyle}>
        {PERSONAL_DATA_LABELS[key]}
      </label>
      <input
        id={key}
        type={type}
        value={formData[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={placeholder || `Enter ${PERSONAL_DATA_LABELS[key]}`}
        style={inputStyle}
        onFocus={(e) => {
          (e.target as HTMLInputElement).style.borderColor = "#2563eb";
        }}
        onBlur={(e) => {
          (e.target as HTMLInputElement).style.borderColor = "#93c5fd";
        }}
      />
    </div>
  );

  const infoBoxStyle: React.CSSProperties = {
    backgroundColor: "#dbeafe",
    border: "2px solid #93c5fd",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "20px",
    fontSize: "15px",
    color: "#1e3a8a",
    lineHeight: "1.5",
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
          👤 My Personal Information
        </h1>
        <p style={{ fontSize: "14px", margin: "4px 0 0", opacity: 0.85 }}>
          Fill in your details to get help with forms
        </p>
      </div>

      <div style={contentStyle}>
        {/* Info box */}
        <div style={infoBoxStyle}>
          <strong>ℹ️ How this works:</strong> Fill in your information below and
          tap <strong>Save</strong>. Then use the{" "}
          <strong>📷 Camera tab</strong> to point your phone at any form — the
          app will show you exactly where to write each piece of information!
        </div>

        {/* Personal Information Section */}
        <div style={sectionTitleStyle}>Personal Information</div>

        {renderField("firstName", "text", "e.g. John")}
        {renderField("lastName", "text", "e.g. Smith")}
        {renderField("dateOfBirth", "text", "e.g. January 15, 1965")}
        {renderField("age", "text", "e.g. 58")}
        {renderField("gender", "text", "e.g. Male")}
        {renderField("email", "email", "e.g. john@example.com")}

        {/* Contact Information Section */}
        <div style={sectionTitleStyle}>Contact Information</div>

        {renderField("phoneNumber", "tel", "e.g. (555) 123-4567")}
        {renderField("streetAddress", "text", "e.g. 123 Main Street")}

        <div style={twoColumnStyle}>
          <div style={fieldGroupStyle}>
            <label htmlFor="city" style={labelStyle}>
              {PERSONAL_DATA_LABELS.city}
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="e.g. Springfield"
              style={inputStyle}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#2563eb";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#93c5fd";
              }}
            />
          </div>
          <div style={fieldGroupStyle}>
            <label htmlFor="state" style={labelStyle}>
              {PERSONAL_DATA_LABELS.state}
            </label>
            <input
              id="state"
              type="text"
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="e.g. CA"
              style={inputStyle}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#2563eb";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#93c5fd";
              }}
            />
          </div>
        </div>

        {renderField("zipCode", "text", "e.g. 90210")}

        {/* Emergency Contact Section */}
        <div style={sectionTitleStyle}>Emergency Contact</div>

        {renderField(
          "emergencyContactName",
          "text",
          "e.g. Jane Smith (spouse)"
        )}
        {renderField(
          "emergencyContactPhone",
          "tel",
          "e.g. (555) 987-6543"
        )}

        {/* Buttons */}
        <div style={{ marginTop: "24px" }}>
          <button style={saveButtonStyle} onClick={handleSave}>
            {saved ? "✅ Saved!" : "💾 Save My Information"}
          </button>

          <button style={clearButtonStyle} onClick={handleClear}>
            🗑️ Clear All Information
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "13px",
            marginTop: "16px",
          }}
        >
          Your information is stored only on this device and never sent to any
          server.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
