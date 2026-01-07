# Envault Setup Guide

This guide explains how to set up **Envault** on a new machine or for a new team member.

## 1. Prerequisites
- Node.js (v18+)
- git

## 2. Installation
Install Envault globally to use it across all your projects.

```bash
npm install -g envault
```

## 3. Fresh Machine Workflow
**Scenario:** You just cloned a repository (e.g., `my-app`) and need the secrets.

1.  **Get the Key**: Ask a team member for the `ENVAULT_KEY` for this project.
    *(Ideally, this is stored in a secure password manager like 1Password).*

2.  **Clone & Enter**:
    ```bash
    git clone https://github.com/org/my-app.git
    cd my-app
    ```

3.  **Restore Secrets**:
    ```bash
    export ENVAULT_KEY=8dbe...
    envault pull
    ```
    ✅ This decrypts `config.enc` -> `.env`.

## 4. Audit Your Workspace
If you have a folder with many projects (e.g., `~/Dev`), you can check the status of all of them at once.

```bash
envault audit -d ~/Dev
```

**Understanding the Output:**
- `PASS` : `.env` exists and is formatted correctly.
- `FAIL` : `.env` has formatting errors (run with `--fix` to repair).
- `MISSING` : `config.enc` exists, but you haven't run `envault pull` yet.
- `UNTRACKED`: You have a local `.env`, but haven't encrypted it (`envault push`) yet.

## 5. Security Best Practices
-   **Never commit `.env`**: Ensure it's in `.gitignore`.
-   **Commit `config.enc`**: This is your source of truth.
-   **Rotate Keys**: If a key is leaked, generate a new one (`envault init`), re-encrypt (`push`), and distribute the new key.
