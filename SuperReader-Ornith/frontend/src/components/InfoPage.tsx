import { useState } from 'react';
import type { UserData } from '../types/userData';

interface InfoPageProps {
  userData: UserData | null;
  onSave: (data: UserData) => void;
  onSwitchToCamera: () => void;
}

const InfoPage = ({ userData, onSave, onSwitchToCamera }: InfoPageProps) => {
  const [formData, setFormData] = useState<UserData>(userData || {
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    email: '',
    ssn: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    employerName: '',
    employerAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    passportNumber: '',
    driverLicenseNumber: '',
    issuingState: '',
    expirationDate: '',
  });

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onSwitchToCamera();
  };

  return (
    <div className="info-page" role="main">
      <h1 className="page-title">Your Information</h1>
      <p className="subtitle">Please fill in all the fields below. This information will be used to help you fill out forms.</p>

      <form className="info-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Personal Information Section */}
        <section className="form-section" aria-labelledby="personal-heading">
          <h2 id="personal-heading" className="section-title">Personal Information</h2>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="firstName" className="form-label">First Name *</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="form-input"
                required
                aria-required="true"
                placeholder="Enter your first name"
                autoComplete="given-name"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="lastName" className="form-label">Last Name *</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="form-input"
                required
                aria-required="true"
                placeholder="Enter your last name"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="dateOfBirth" className="form-label">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="form-input"
                required
                aria-required="true"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="placeOfBirth" className="form-label">Place of Birth</label>
              <input
                type="text"
                id="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                className="form-input"
                placeholder="City, State/Country"
                autoComplete="birth-place"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="form-select"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-Binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="maritalStatus" className="form-label">Marital Status</label>
              <select
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) => handleChange('maritalStatus', e.target.value)}
                className="form-select"
              >
                <option value="">Select...</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="nationality" className="form-label">Nationality</label>
              <input
                type="text"
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
                className="form-input"
                placeholder="Your nationality"
                autoComplete="nationality"
              />
            </div>
          </div>
        </section>

        {/* Address Section */}
        <section className="form-section" aria-labelledby="address-heading">
          <h2 id="address-heading" className="section-title">Address</h2>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="addressLine1" className="form-label">Street Address Line 1 *</label>
              <input
                type="text"
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                className="form-input"
                required
                aria-required="true"
                placeholder="Street number and name"
                autoComplete="street-address"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="addressLine2" className="form-label">Street Address Line 2</label>
              <input
                type="text"
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                className="form-input"
                placeholder="Apartment, suite, unit, building, floor, etc."
                autoComplete="address-line2"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="city" className="form-label">City *</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="form-input"
                required
                aria-required="true"
                placeholder="City"
                autoComplete="address-level2"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="state" className="form-label">State *</label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="form-select"
                required
                aria-required="true"
              >
                <option value="">Select State...</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="zipCode" className="form-label">ZIP Code *</label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className="form-input"
                required
                aria-required="true"
                placeholder="ZIP Code (12345 or 12345-6789)"
                pattern="[0-9]{5}(-[0-9]{4})?"
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="country" className="form-label">Country</label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="form-select"
                autoComplete="country"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="form-section" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="section-title">Contact Information</h2>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="phone" className="form-label">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="form-input"
                required
                aria-required="true"
                placeholder="(123) 456-7890"
                pattern="[0-9\-\(\)\s+]*"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
          </div>
        </section>

        {/* Government ID Section */}
        <section className="form-section" aria-labelledby="id-heading">
          <h2 id="id-heading" className="section-title">Government Identification</h2>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="ssn" className="form-label">Social Security Number (SSN)</label>
              <input
                type="password"
                id="ssn"
                value={formData.ssn}
                onChange={(e) => handleChange('ssn', e.target.value)}
                className="form-input"
                placeholder="XXX-XX-XXXX"
                pattern="[0-9]{3}-?[0-9]{2}-?[0-9]{4}"
                inputMode="numeric"
                autoComplete="off"
              />
              <p className="field-helper">Enter your Social Security Number if applicable</p>
            </div>

            <div className="form-group full-width">
              <label htmlFor="driverLicenseNumber" className="form-label">Driver's License Number</label>
              <input
                type="text"
                id="driverLicenseNumber"
                value={formData.driverLicenseNumber}
                onChange={(e) => handleChange('driverLicenseNumber', e.target.value)}
                className="form-input"
                placeholder="License number"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="issuingState" className="form-label">Issuing State</label>
              <select
                id="issuingState"
                value={formData.issuingState}
                onChange={(e) => handleChange('issuingState', e.target.value)}
                className="form-select"
              >
                <option value="">Select State...</option>
                {/* Same state options as above */}
                {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="expirationDate" className="form-label">Expiration Date</label>
              <input
                type="date"
                id="expirationDate"
                value={formData.expirationDate}
                onChange={(e) => handleChange('expirationDate', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="passportNumber" className="form-label">Passport Number</label>
              <input
                type="text"
                id="passportNumber"
                value={formData.passportNumber}
                onChange={(e) => handleChange('passportNumber', e.target.value)}
                className="form-input"
                placeholder="Passport number"
                autoComplete="off"
              />
            </div>
          </div>
        </section>

        {/* Employment Section */}
        <section className="form-section" aria-labelledby="employment-heading">
          <h2 id="employment-heading" className="section-title">Employment Information</h2>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="occupation" className="form-label">Occupation</label>
              <input
                type="text"
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="form-input"
                placeholder="Your occupation"
                autoComplete="organization-title"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="employerName" className="form-label">Employer Name</label>
              <input
                type="text"
                id="employerName"
                value={formData.employerName}
                onChange={(e) => handleChange('employerName', e.target.value)}
                className="form-input"
                placeholder="Current employer"
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="employerAddress" className="form-label">Employer Address</label>
              <input
                type="text"
                id="employerAddress"
                value={formData.employerAddress}
                onChange={(e) => handleChange('employerAddress', e.target.value)}
                className="form-input"
                placeholder="Employer address"
              />
            </div>
          </div>
        </section>

        {/* Emergency Contact Section */}
        <section className="form-section" aria-labelledby="emergency-heading">
          <h2 id="emergency-heading" className="section-title">Emergency Contact</h2>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="emergencyContactName" className="form-label">Emergency Contact Name</label>
              <input
                type="text"
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                className="form-input"
                placeholder="Full name of emergency contact"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="emergencyContactPhone" className="form-label">Emergency Contact Phone</label>
              <input
                type="tel"
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                className="form-input"
                placeholder="(123) 456-7890"
                inputMode="tel"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="emergencyContactRelationship" className="form-label">Relationship</label>
              <input
                type="text"
                id="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
                className="form-input"
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="save-button primary">
            Save & Continue to Reader
          </button>
        </div>
      </form>
    </div>
  );
};

export default InfoPage;
