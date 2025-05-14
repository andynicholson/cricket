# Cricket

A modern Electron application built with React, TypeScript, and Tailwind CSS.

## Features

- 🚀 Modern React with TypeScript
- 🎨 Tailwind CSS for styling
- 📦 Electron Forge for packaging
- 🔄 Auto-updates
- 🔒 Secure IPC communication
- 📱 Cross-platform support
- 🧪 Testing setup with Jest
- 📝 ESLint and Prettier for code quality

## Development

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm start
```

### Building

To create a production build:

```bash
npm run make
```

This will create platform-specific packages in the `out` directory.

### Testing

To run tests:

```bash
npm test
```

## Project Structure

```
cricket/
├── src/
│   ├── main/           # Main process code
│   ├── renderer/       # Renderer process code
│   ├── shared/         # Shared types and utilities
│   └── preload/        # Preload scripts
├── scripts/            # Build and utility scripts
├── config/            # Configuration files
├── assets/            # Static assets
└── tests/             # Test files
```

## License

MIT 