# Fix SSH Key Permission Denied Issue

## Step 1: Verify the public key was copied correctly

On your local machine (PowerShell), check what the public key looks like:

```powershell
Get-Content $env:USERPROFILE\.ssh\github_actions_key.pub
```

You should see something like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-actions@annhurst-ts.com
```

## Step 2: SSH into your server and check

```bash
ssh david@168.231.114.46
```

## Step 3: Check if the public key file exists on server

```bash
cat ~/.ssh/github_actions_key.pub
```

If it doesn't exist or is empty, you need to copy it again.

## Step 4: Verify authorized_keys permissions

```bash
# Check current permissions
ls -la ~/.ssh/

# Fix permissions if needed
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## Step 5: Add the public key to authorized_keys (if not already there)

```bash
# Check if the key is already in authorized_keys
grep "github-actions" ~/.ssh/authorized_keys

# If not found, add it
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Verify it was added
tail -1 ~/.ssh/authorized_keys
```

## Step 6: Verify the key format in authorized_keys

The authorized_keys file should have one key per line. Check:

```bash
cat ~/.ssh/authorized_keys
```

You should see your personal key:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAZrBXChCIiXun5D6U7aDYEkRHcQiinwIXfDsD4GUjO5 djonah04@gmail.com
```

And your new GitHub Actions key:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-actions@annhurst-ts.com
```

## Step 7: Test with verbose output

Exit the server and test from your local machine:

```powershell
ssh -v -i $env:USERPROFILE\.ssh\github_actions_key david@168.231.114.46
```

Look for lines like:
- "Offering public key"
- "Server accepts key"
- Any error messages

## Alternative: Manual copy method

If scp didn't work, manually copy the public key:

1. **On your local machine (PowerShell):**
   ```powershell
   Get-Content $env:USERPROFILE\.ssh\github_actions_key.pub
   ```
   Copy the entire output.

2. **On your server:**
   ```bash
   nano ~/.ssh/github_actions_key.pub
   ```
   Paste the public key, save (Ctrl+O, Enter, Ctrl+X)

3. **Add to authorized_keys:**
   ```bash
   cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

## Step 8: Check SSH server logs (if still failing)

On your server:
```bash
sudo tail -f /var/log/auth.log
```

Then try connecting from your local machine. Look for error messages in the log.

