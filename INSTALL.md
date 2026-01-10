# Quick Installation Guide

## Global Installation (3 commands)

```bash
npm install
npm run install-global
```

That's it! Now you can use `ralph-loop` from any directory.

## Test It

```bash
cd ~/my-project
ralph-loop -p "Add documentation to all functions" -m 3
```

## Uninstall

```bash
cd /home/user/ralph-loop
npm run uninstall-global
```

## What Does It Do?

1. `npm install` - Installs dependencies
2. `npm run install-global` - Builds the TypeScript and links the `ralph-loop` command globally

The command will be available system-wide after installation.
