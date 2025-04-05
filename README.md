# SecurePass - Password Manager

A modern, secure password manager built with React, TypeScript, and Vite. This application allows you to securely store and manage your passwords with client-side encryption.

## Features

- **PIN-Based Authentication**: Simple and secure PIN-based login system
- **User Registration**: Create a new account with a username and PIN
- **Encrypted Storage**: All passwords are encrypted with AES-256 before storing in IndexedDB
- **Password Management**: Add, edit, copy, and delete passwords with ease
- **Show/Hide Passwords**: Toggle password visibility in lists and forms
- **Search with Autocomplete**: Quickly find passwords with search autocomplete
- **Import/Export**: Backup and restore your passwords as JSON
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Account Management**: Change credentials or delete your account
- **Copy to Clipboard**: One-click copying of usernames and passwords

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/password-manager.git
   cd password-manager
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Build for production:

   ```
   npm run build
   ```

## Usage

1. **First Time Setup**: Register a new account with a username and PIN
2. **Login**: Use your credentials to access your passwords
3. **Add Passwords**: Click "Add Password" to store new credentials
4. **Search**: Use the search box to find specific passwords
5. **Edit/Delete**: Manage your saved passwords as needed
6. **Import/Export**: Access the three-dot menu to import or export your data
7. **Account Management**: Delete your account or change credentials as needed

## Security Features

- **PIN Hashing**: PINs are hashed with PBKDF2 (1000 iterations) before storage
- **AES-256 Encryption**: All passwords are encrypted with AES-256
- **Client-Side Security**: All encryption/decryption happens locally in your browser
- **No Server Storage**: Data is stored only in your device's IndexedDB
- **Session Storage**: Authentication state is only kept in session storage (cleared when browser is closed)
- **Secure Account Deletion**: All passwords are wiped when account is deleted

## Technical Implementation

- **React**: UI components and state management
- **TypeScript**: Type safety and better developer experience
- **Dexie.js**: IndexedDB wrapper for data storage
- **Crypto-JS**: Password encryption and hashing
- **CSS Custom Properties**: Theming and responsive design
- **Context API**: Global state management

## Future Enhancements

- Password strength meter
- Automatic password generation
- Password expiration reminders
- Biometric authentication
- Browser extension

## License

MIT

## Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Dexie.js](https://dexie.org/)
- [Crypto-JS](https://github.com/brix/crypto-js)
