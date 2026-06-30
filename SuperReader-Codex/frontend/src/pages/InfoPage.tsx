import { useNavigate } from 'react-router-dom';
import { AccessibleInput } from '../components/AccessibleInput';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  EMPTY_USER_INFO,
  FIELD_LABELS,
  type UserInfo,
} from '../types';

export function InfoPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useLocalStorage<UserInfo>(
    'superReaderUserInfo',
    EMPTY_USER_INFO
  );

  const handleChange = (key: keyof UserInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserInfo((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Required minimum fields
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.streetAddress) {
      alert('Please fill in at least your first name, last name, and street address.');
      return;
    }
    navigate('/read');
  };

  const orderedFields: (keyof UserInfo)[] = [
    'firstName',
    'lastName',
    'middleInitial',
    'dateOfBirth',
    'socialSecurityNumber',
    'streetAddress',
    'apartmentUnit',
    'city',
    'state',
    'zipCode',
    'phoneNumber',
    'email',
    'other',
  ];

  const sensitiveFields: (keyof UserInfo)[] = ['socialSecurityNumber'];

  return (
    <main className="page info-page" aria-label="Your Information">
      <header className="page-header">
        <h1>Your Information</h1>
        <p className="page-intro">
          Fill in the details you would normally write on a form. They will be
          saved on this phone only.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="info-form" noValidate>
        {orderedFields.map((key) => {
          const isSensitive = sensitiveFields.includes(key);
          return (
            <AccessibleInput
              key={key}
              label={FIELD_LABELS[key]}
              type="text"
              inputMode={isSensitive ? 'numeric' : undefined}
              autoComplete={isSensitive ? 'off' : autocompleteFor(key)}
              value={userInfo[key]}
              onChange={handleChange(key)}
              placeholder={FIELD_LABELS[key]}
            />
          );
        })}

        <div className="privacy-notice" role="note">
          <strong>Privacy note:</strong> This information is stored in your
          browser on this device. It is sent to the configured AI service only
          when you press “Read” so it can find matching fields on your form.
        </div>

        <button type="submit" className="big-button save-button">
          Save & Open Reader
        </button>
      </form>
    </main>
  );
}

function autocompleteFor(key: keyof UserInfo): string | undefined {
  switch (key) {
    case 'firstName':
      return 'given-name';
    case 'lastName':
      return 'family-name';
    case 'middleInitial':
      return 'additional-name';
    case 'dateOfBirth':
      return 'bday';
    case 'socialSecurityNumber':
      return undefined;
    case 'streetAddress':
      return 'street-address';
    case 'apartmentUnit':
      return undefined;
    case 'city':
      return 'address-level2';
    case 'state':
      return 'address-level1';
    case 'zipCode':
      return 'postal-code';
    case 'phoneNumber':
      return 'tel';
    case 'email':
      return 'email';
    case 'other':
      return undefined;
    default:
      return undefined;
  }
}
