# GitHub Actions CI/CD Setup Guide

This guide will help you set up automated deployment using GitHub Actions.

## Prerequisites

1. Your server is accessible via SSH
2. You have SSH key access to your server (as per your methodology.txt)
3. Your GitHub repository is set up

## Step 1: Generate SSH Key for GitHub Actions (if needed)

If you want to use a separate SSH key for GitHub Actions (recommended), generate one on your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions@annhurst-ts.com" -f ~/.ssh/github_actions_key
```

**Don't add a passphrase** (press Enter when prompted).

## Step 2: Add Public Key to Server

Copy the public key to your server:

```bash
# Windows PowerShell
scp $env:USERPROFILE\.ssh\github_actions_key.pub david@168.231.114.46:~/.ssh/authorized_keys_github_actions

# Mac/Linux
scp ~/.ssh/github_actions_key.pub david@168.231.114.46:~/.ssh/authorized_keys_github_actions
```

Then on your server, add it to authorized_keys:

```bash
ssh david@168.231.114.46
cat ~/.ssh/authorized_keys_github_actions >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following secrets:

### Required Secrets:

1. **SSH_PRIVATE_KEY**
   - Value: The **private** SSH key content
   - To get it:
     ```bash
     # Windows PowerShell
     Get-Content $env:USERPROFILE/.ssh/id_ed25519
     
     # Mac/Linux
     cat ~/.ssh/id_ed25519
     ```
   - Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

2. **SSH_USER**
   - Value: `david` (or your server username)

3. **SERVER_HOST**
   - Value: `168.231.114.46` (or your server IP/domain)

## Step 4: Verify Workflow

1. Make a small change to your code
2. Commit and push to the `master` branch:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin master
   ```

3. Go to your GitHub repository → **Actions** tab
4. You should see the workflow running
5. Check the logs to ensure deployment succeeds

## Step 5: Monitor Deployment

After pushing, you can:
- Check GitHub Actions logs in real-time
- SSH into your server and check PM2 status: `pm2 status`
- View PM2 logs: `pm2 logs nextjs`

## Troubleshooting

### SSH Connection Fails
- Verify the SSH_PRIVATE_KEY secret is correct (include BEGIN/END lines)
- Check that the public key is in `~/.ssh/authorized_keys` on the server
- Test SSH connection manually: `ssh -i ~/.ssh/id_ed25519 david@168.231.114.46`

### Build Fails
- Check if all dependencies are in `package.json`
- Verify Node.js version on server matches your project requirements
- Check PM2 logs: `pm2 logs nextjs`

### PM2 Restart Fails
- The workflow will try to start PM2 if restart fails
- Manually check PM2: `pm2 status`
- If needed, manually start: `pm2 start npm --name "nextjs" -- start`

## Security Notes

- Never commit your SSH private key to the repository
- Use GitHub Secrets for all sensitive information
- Consider using a dedicated SSH key for CI/CD (separate from your personal key)
- Regularly rotate SSH keys

## Customization

If your project structure differs, update the workflow file (`.github/workflows/deploy.yml`):
- Change the project path: `cd ~/apps/Annhurst-ts`
- Modify branch name: `branches: - master` (change to `main` if needed)
- Add additional deployment steps as needed

