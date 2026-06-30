import type { ChangeEvent } from "react";
import { ShieldAlert, Trash2 } from "lucide-react";
import type { Profile } from "./types";

type Field = {
  key: keyof Profile;
  label: string;
  type?: string;
  autocomplete?: string;
};

const sections: Array<{ title: string; fields: Field[] }> = [
  {
    title: "Name",
    fields: [
      { key: "firstName", label: "First name", autocomplete: "given-name" },
      { key: "middleName", label: "Middle name" },
      { key: "lastName", label: "Last name", autocomplete: "family-name" },
      { key: "preferredName", label: "Preferred name" },
      { key: "dateOfBirth", label: "Date of birth", type: "date", autocomplete: "bday" },
      { key: "socialSecurityNumber", label: "Social Security number", autocomplete: "off" }
    ]
  },
  {
    title: "Contact",
    fields: [
      { key: "phoneNumber", label: "Phone number", type: "tel", autocomplete: "tel" },
      { key: "alternatePhone", label: "Alternate phone", type: "tel" },
      { key: "email", label: "Email", type: "email", autocomplete: "email" }
    ]
  },
  {
    title: "Home Address",
    fields: [
      { key: "streetAddress", label: "Street address", autocomplete: "address-line1" },
      { key: "apartment", label: "Apartment or unit", autocomplete: "address-line2" },
      { key: "city", label: "City", autocomplete: "address-level2" },
      { key: "state", label: "State", autocomplete: "address-level1" },
      { key: "zipCode", label: "ZIP code", autocomplete: "postal-code" },
      { key: "county", label: "County" },
      { key: "country", label: "Country", autocomplete: "country-name" }
    ]
  },
  {
    title: "Mailing Address",
    fields: [
      { key: "mailingStreetAddress", label: "Mailing street address" },
      { key: "mailingApartment", label: "Mailing apartment or unit" },
      { key: "mailingCity", label: "Mailing city" },
      { key: "mailingState", label: "Mailing state" },
      { key: "mailingZipCode", label: "Mailing ZIP code" }
    ]
  },
  {
    title: "Government Form Details",
    fields: [
      { key: "citizenshipStatus", label: "Citizenship status" },
      { key: "maritalStatus", label: "Marital status" },
      { key: "sex", label: "Sex" },
      { key: "veteranStatus", label: "Veteran status" },
      { key: "householdSize", label: "Household size", type: "number" },
      { key: "annualIncome", label: "Annual income" }
    ]
  },
  {
    title: "Work",
    fields: [
      { key: "employerName", label: "Employer name" },
      { key: "occupation", label: "Occupation" }
    ]
  },
  {
    title: "Emergency Contact",
    fields: [
      { key: "emergencyContactName", label: "Emergency contact name" },
      { key: "emergencyContactRelationship", label: "Relationship" },
      { key: "emergencyContactPhone", label: "Emergency contact phone", type: "tel" }
    ]
  },
  {
    title: "Insurance and IDs",
    fields: [
      { key: "insuranceProvider", label: "Insurance provider" },
      { key: "policyNumber", label: "Policy number" },
      { key: "medicareNumber", label: "Medicare number" },
      { key: "medicaidNumber", label: "Medicaid number" },
      { key: "driverLicenseNumber", label: "Driver license number" },
      { key: "driverLicenseState", label: "Driver license state" }
    ]
  }
];

type ProfilePageProps = {
  profile: Profile;
  completionCount: number;
  savedMessage: string;
  onChange: (profile: Profile) => void;
  onClear: () => void;
  onSave: () => void;
};

export function ProfilePage({
  profile,
  completionCount,
  savedMessage,
  onChange,
  onClear,
  onSave
}: ProfilePageProps) {
  function handleChange(key: keyof Profile) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      onChange({ ...profile, [key]: event.target.value });
    };
  }

  return (
    <section className="info-page" aria-labelledby="info-heading">
      <div className="info-header">
        <div>
          <p className="app-name">SuperReader</p>
          <h1 id="info-heading">Your Information</h1>
        </div>
        <div className="field-count" aria-label={`${completionCount} saved fields`}>
          {completionCount}
        </div>
      </div>

      <div className="privacy-note">
        <ShieldAlert aria-hidden="true" />
        <p>Stored on this device in localStorage. Use a trusted phone or browser profile.</p>
      </div>

      <form
        className="profile-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        {sections.map((section) => (
          <fieldset className="form-section" key={section.title}>
            <legend>{section.title}</legend>
            <div className="field-grid">
              {section.fields.map((field) => (
                <label className="text-field" key={field.key}>
                  <span>{field.label}</span>
                  <input
                    autoComplete={field.autocomplete}
                    inputMode={field.type === "number" ? "numeric" : undefined}
                    type={field.type ?? "text"}
                    value={profile[field.key]}
                    onChange={handleChange(field.key)}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="form-actions">
          <button className="primary-action" type="submit">
            Save and Read
          </button>
          <button className="secondary-action" type="button" onClick={onClear}>
            <Trash2 aria-hidden="true" />
            Clear
          </button>
        </div>

        <div className="save-status" aria-live="polite">
          {savedMessage}
        </div>
      </form>
    </section>
  );
}
