import { useEffect, useState } from "react";
import {
  EMPTY_PROFILE,
  formatDOB,
  formatPhone,
  formatSSN,
  saveProfile,
  type UserProfile,
} from "../profile";

interface Props {
  profile: UserProfile;
  onSaved: () => void;
}

export function InfoPage({ profile, onSaved }: Props) {
  const [form, setForm] = useState<UserProfile>({ ...EMPTY_PROFILE, ...profile });
  const [saved, setSaved] = useState(false);

  // Keep form synced if external profile changes (e.g. tab switch reload)
  useEffect(() => {
    setForm({ ...EMPTY_PROFILE, ...profile });
  }, [profile]);

  const set = <K extends keyof UserProfile>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const setFormatted = (
    key: keyof UserProfile,
    raw: string,
    fmt: (v: string) => string
  ) => {
    set(key, fmt(raw));
  };

  const handleSave = () => {
    saveProfile(form);
    setSaved(true);
    // Brief delay so the user sees confirmation, then switch to Read.
    setTimeout(() => onSaved(), 500);
  };

  const handleClear = () => {
    if (confirm("Clear all saved information? This cannot be undone.")) {
      const empty = { ...EMPTY_PROFILE };
      setForm(empty);
      saveProfile(empty);
      setSaved(false);
    }
  };

  return (
    <div className="info">
      <h1>Your Information</h1>
      <p style={{ textAlign: "center", fontSize: "1.1rem", margin: "0 0 1rem" }}>
        Fill this in once. We'll save it on this phone and use it to help you fill out forms.
      </p>

      <section>
        <h2>Name</h2>
        <div className="field-row">
          <div className="field">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="middleName">Middle Name</label>
          <input
            id="middleName"
            type="text"
            autoComplete="additional-name"
            value={form.middleName}
            onChange={(e) => set("middleName", e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2>Date of Birth &amp; ID</h2>
        <div className="field-row">
          <div className="field">
            <label htmlFor="dob">Date of Birth (MM/DD/YYYY)</label>
            <input
              id="dob"
              type="text"
              inputMode="numeric"
              placeholder="MM/DD/YYYY"
              value={form.dob}
              onChange={(e) => setFormatted("dob", e.target.value, formatDOB)}
            />
          </div>
          <div className="field">
            <label htmlFor="ssn">Social Security Number</label>
            <input
              id="ssn"
              type="text"
              inputMode="numeric"
              placeholder="XXX-XX-XXXX"
              value={form.ssn}
              onChange={(e) => setFormatted("ssn", e.target.value, formatSSN)}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Contact</h2>
        <div className="field">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            value={form.phone}
            onChange={(e) => setFormatted("phone", e.target.value, formatPhone)}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2>Address</h2>
        <div className="field">
          <label htmlFor="street">Street Address</label>
          <input
            id="street"
            type="text"
            autoComplete="address-line1"
            value={form.street}
            onChange={(e) => set("street", e.target.value)}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="unit">Apt / Unit</label>
            <input
              id="unit"
              type="text"
              autoComplete="address-line2"
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="state">State</label>
            <input
              id="state"
              type="text"
              autoComplete="address-level1"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="zip">ZIP Code</label>
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              value={form.zip}
              onChange={(e) => set("zip", e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <input
            id="country"
            type="text"
            autoComplete="country-name"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2>Employment</h2>
        <div className="field">
          <label htmlFor="employer">Employer</label>
          <input
            id="employer"
            type="text"
            value={form.employer}
            onChange={(e) => set("employer", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="occupation">Occupation</label>
          <input
            id="occupation"
            type="text"
            value={form.occupation}
            onChange={(e) => set("occupation", e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2>Emergency Contact</h2>
        <div className="field">
          <label htmlFor="emergencyName">Contact Name</label>
          <input
            id="emergencyName"
            type="text"
            value={form.emergencyName}
            onChange={(e) => set("emergencyName", e.target.value)}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="emergencyPhone">Contact Phone</label>
            <input
              id="emergencyPhone"
              type="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              value={form.emergencyPhone}
              onChange={(e) =>
                setFormatted("emergencyPhone", e.target.value, formatPhone)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="emergencyRelationship">Relationship</label>
            <input
              id="emergencyRelationship"
              type="text"
              placeholder="e.g. Spouse"
              value={form.emergencyRelationship}
              onChange={(e) => set("emergencyRelationship", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Signature</h2>
        <div className="field">
          <label htmlFor="signatureName">Signature Name (as you sign)</label>
          <input
            id="signatureName"
            type="text"
            value={form.signatureName}
            onChange={(e) => set("signatureName", e.target.value)}
          />
        </div>
      </section>

      <div className="save-bar">
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? "Saved!" : "Save"}
        </button>
        <button className="btn btn-danger" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
