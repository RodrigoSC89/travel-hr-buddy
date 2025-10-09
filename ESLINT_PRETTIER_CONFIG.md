# ESLint and Prettier Configuration

This project uses ESLint for code linting and Prettier for code formatting.

## Configuration Files

- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.eslintignore` - Files to exclude from ESLint
- `.prettierignore` - Files to exclude from Prettier

## Available Scripts

### Linting
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Automatically fix linting errors

### Formatting
- `npm run format` - Format all source files
- `npm run format:check` - Check if files are formatted correctly

## ESLint Rules

The project follows these key rules:
- **Quotes**: Double quotes required (`"hello"` not `'hello'`)
- **Semicolons**: Required at end of statements
- **Indentation**: 2 spaces
- **React**: React 18+ (no need to import React in JSX files)
- **TypeScript**: Recommended TypeScript rules enabled
- **Unused Variables**: Warning (not error)

## Prettier Configuration

- **Semi**: Always use semicolons
- **Single Quote**: False (use double quotes)
- **Tab Width**: 2 spaces
- **Print Width**: 100 characters
- **Trailing Comma**: ES5 style
- **Arrow Parens**: Avoid when possible

## Usage

Before committing code, run:

```bash
npm run lint:fix
npm run format
```

This will ensure your code meets the project's style guidelines.
