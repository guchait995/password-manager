# Password Manager PWA - User Guide

This guide explains how to use the Password Manager PWA to securely store your passwords.

## Getting Started

### First Time Setup

1. When you first open the app, you'll see a login screen.
2. Use the default credentials:
   - Username: `admin`
   - Password: `admin`
3. After logging in, it's highly recommended to change these default credentials for security.

### Navigation

The app has three main tabs:

- **Passwords**: View, search, edit, and delete your saved passwords
- **Add New**: Add new password entries
- **Import/Export**: Import or export your password data

## Managing Passwords

### Adding a New Password

1. Go to the "Add New" tab
2. Fill in the required fields:
   - Title (e.g., "Gmail", "Netflix")
   - Username/Email
   - Password
3. Optional fields:
   - Website URL
   - Category (e.g., "Social Media", "Finance")
   - Notes
4. Click "Add Password"

### Viewing Passwords

1. Go to the "Passwords" tab
2. Use the search box to filter passwords by title, username, website, or category
3. Click "Show" to view a password
4. Click "Copy" to copy the username or password to clipboard

### Editing Passwords

1. In the "Passwords" tab, find the password you want to edit
2. Click the "Edit" button
3. Update the information as needed
4. Click "Save"

### Deleting Passwords

1. In the "Passwords" tab, find the password you want to delete
2. Click the "Delete" button
3. Confirm the deletion

## Import and Export

### Exporting Your Passwords

1. Go to the "Import/Export" tab
2. Click "Export Passwords"
3. The app will generate a JSON file for download
4. Save this file in a secure location

### Importing Passwords

1. Go to the "Import/Export" tab
2. Click "Import Passwords"
3. Select your previously exported JSON file
4. Confirm the import

## Security Features

- All passwords are encrypted with AES-256 before being stored
- Your master password is never stored directly; only a securely hashed version is kept
- All data is stored locally in your browser; nothing is sent to external servers
- You'll be automatically logged out when you close the browser tab

## Using as a PWA on iPhone

1. Visit the application URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and select "Add to Home Screen"
4. Give it a name and tap "Add"
5. The app will now appear on your home screen and work offline

## Troubleshooting

### Forgot Master Password

As this is a completely local application with no server-side storage, there is no password recovery option. If you forget your master password, you cannot retrieve your passwords.

Always export your passwords regularly as a backup.

### Data Not Syncing Between Devices

This app stores all data locally on your device. There is no automatic syncing between devices. You'll need to manually export data from one device and import it on another.

### Offline Access Issues

If you're having trouble accessing the app offline:

1. Make sure you've visited the app while online at least once
2. On iPhone, ensure you've added it to your home screen
3. Check that you haven't cleared your browser cache recently
