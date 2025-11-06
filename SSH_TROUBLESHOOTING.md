# SSH Connection Troubleshooting Guide

## Common Error: "Permission denied (publickey)"

This means GitHub Actions can't authenticate with your server. Follow these steps:

## Step 1: Verify Your SSH Key Format

Your `SSH_PRIVATE_KEY` secret in GitHub must include:
- The BEGIN line: `-----BEGIN OPENSSH PRIVATE KEY-----`
- All the key content (multiple lines)
- The END line: `-----END OPENSSH PRIVATE KEY-----`

### How to get your private key (Windows PowerShell):

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519
```

**Important:** Copy the ENTIRE output, including:
- First line: `-----BEGIN OPENSSH PRIVATE KEY-----`
- All lines in between
- Last line: `-----END OPENSSH PRIVATE KEY-----`

### Common Mistakes:
- ❌ Missing the BEGIN/END lines
- ❌ Only copying part of the key
- ❌ Extra spaces or line breaks
- ❌ Using the public key (.pub) instead of private key

## Step 2: Verify Public Key is on Server

SSH into your server and check:

```bash
ssh david@168.231.114.46
cat ~/.ssh/authorized_keys
```

You should see your public key (from `id_ed25519.pub`). If not, add it:

```bash
# On your local machine (PowerShell):
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Copy the output, then on your server:

```bash
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Test SSH Connection Locally

Test if your key works from your local machine:

```powershell
# Windows PowerShell
ssh -i $env:USERPROFILE\.ssh\id_ed25519 david@168.231.114.46
```

If this works, your key is correct. If it fails, the issue is with your key setup.

## Step 4: Verify GitHub Secrets

Go to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Verify these secrets exist:

   - **SSH_PRIVATE_KEY**: Your full private key (with BEGIN/END lines)
   - **SSH_USER**: `david` (or your username)
   - **SERVER_HOST**: `168.231.114.46` (or your server IP/domain)

## Step 5: Check Server SSH Configuration

On your server, verify SSH settings:

```bash
sudo nano /etc/ssh/sshd_config
```

Make sure these are set:
```
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication no  # (for security)
```

Then restart SSH:
```bash
sudo systemctl restart ssh
# or
sudo systemctl restart sshd
```

## Step 6: Test with Verbose Output

If still failing, test with verbose SSH output:

```powershell
ssh -v -i $env:USERPROFILE\.ssh\id_ed25519 david@168.231.114.46
```

Look for error messages that indicate what's wrong.

## Step 7: Alternative - Use a Dedicated Key for GitHub Actions

If your personal key doesn't work, create a new key just for GitHub Actions:

### On your local machine (PowerShell):

```powershell
# Generate new key
ssh-keygen -t ed25519 -C "github-actions@annhurst-ts.com" -f $env:USERPROFILE\.ssh\github_actions_key

# Don't add a passphrase (press Enter) 

# View the private key
Get-Content $env:USERPROFILE\.ssh\github_actions_key

# View the public key
Get-Content $env:USERPROFILE\.ssh\github_actions_key.pub
```

### Add public key to server:

```powershell
# Copy public key to server
scp $env:USERPROFILE\.ssh\github_actions_key.pub david@168.231.114.46:~/.ssh/
```

### On server:

```bash
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Add private key to GitHub Secrets:

Use the content from `github_actions_key` (not the .pub file) as your `SSH_PRIVATE_KEY` secret.

## Quick Checklist

- [ ] Private key includes BEGIN and END lines
- [ ] Public key is in `~/.ssh/authorized_keys` on server
- [ ] `authorized_keys` has correct permissions (600)
- [ ] GitHub Secrets are set correctly
- [ ] SSH connection works from local machine
- [ ] Server SSH config allows public key authentication

## Still Having Issues?

1. Check GitHub Actions logs for detailed error messages
2. Try the "Test SSH Connection" step in the workflow (it will show more details)
3. Verify your server firewall allows SSH (port 22)
4. Check server logs: `sudo tail -f /var/log/auth.log` (on Ubuntu/Debian)

