# Shendure Lab Website Update — Quick Reference

A step-by-step workflow for pushing updates to `shendurelab.github.io` using Claude Code.

---

## Before you start
- Have ready: what you want to change (content, photo, etc.) and any new files in the project folder
- If this is your first time, complete the **First-Time Setup** section below before anything else

---

## Where things live (read this once)

You have **two important folders** to understand:

| Where | What it is | Use it for |
|---|---|---|
| **GitHub** (https://github.com/shendurelab/shendurelab.github.io) | The master copy in the cloud — what gets deployed to the live site | Reviewing PRs, watching deploy status. Don't upload files directly here. |
| **Your local folder** (`~/Projects/shendurelab.github.io`) | A copy on your laptop you can edit and preview | All editing, all file drops (images, PDFs), all Claude Code work |

**The rule:** edit locally → push to GitHub via PR → deploy. Never edit on GitHub directly.

The local folder is created by cloning the repo from GitHub (see First-Time Setup below). It must live in a plain local folder like `~/Projects/` — not in any cloud-synced folder (iCloud Drive, Dropbox, OneDrive, Google Drive), which corrupts the build files. GitHub itself is your backup.

### Where to drop new files (always into your local folder):

| File type | Drop into |
|---|---|
| Lab member photos | `~/Projects/shendurelab.github.io/public/images/lab/` |
| Publication thumbnails | `~/Projects/shendurelab.github.io/public/images/papers/` |
| Fun page photos | `~/Projects/shendurelab.github.io/public/images/fun/` |
| Press article images | `~/Projects/shendurelab.github.io/public/images/press/` |
| PDFs (papers, etc.) | `~/Projects/shendurelab.github.io/public/documents/` |

You can drag-and-drop straight from Finder. Then commit and push them through the normal PR workflow below.

---

## First-Time Setup (do this once)

Skip this section if you've already done these steps. You only need to do it once per computer.

### A. Get access to the right accounts

You'll need:
1. **A Shendure Lab Claude account** — talk to your boss to get added to the lab's Claude Team workspace, which gives you Claude Code access
2. **A GitHub account that's a member of the `shendurelab` organization** — your boss needs to invite you with at least **Write** permission on the `shendurelab.github.io` repo. Check at https://github.com/orgs/shendurelab/people

### B. Install required tools

Open Terminal and run each command. If a tool is already installed, it'll just print a version number.

```bash
# Check git (comes with Mac developer tools)
git --version

# If not installed:
xcode-select --install

# Install GitHub CLI (Mac)
brew install gh
# If you don't have Homebrew, install it first: https://brew.sh/

# Install Node.js (needed for npm and the Astro build)
brew install node

# Install Claude Code
curl -fsSL https://claude.ai/install.sh | bash
```

After running each install, **close and reopen Terminal** so the new commands are available.

### C. Configure git with your identity

```bash
git config --global user.name "Your Name"
git config --global user.email "your-github-email@example.com"
```

Use the email tied to your GitHub account.

### D. Authenticate the GitHub CLI

```bash
gh auth login
```

Answer the prompts:
- *Account?* → **GitHub.com**
- *Protocol?* → **HTTPS**
- *Authenticate Git with credentials?* → **Yes**
- *How to authenticate?* → **Login with a web browser**

Copy the one-time code, paste it in the browser when prompted, approve access, return to Terminal. Verify with:

```bash
gh auth status
```

You should see `✓ Logged in to github.com as your-username`.

### E. Authenticate Claude Code

```bash
claude
```

It'll prompt you to log in. Choose the option for your paid plan (Team/Pro/Max), authenticate via browser using your **Shendure Lab Claude account**, then return to Terminal.

### F. Clone the website repo (download a local copy)

Clone the repo into a plain local folder like `~/Projects/`. Do NOT use iCloud Drive, Dropbox, OneDrive, Google Drive, or any other cloud-synced folder — they corrupt the build files.

```bash
mkdir -p ~/Projects
cd ~/Projects
gh repo clone shendurelab/shendurelab.github.io
cd shendurelab.github.io
```

### G. Install the website's dependencies

This downloads everything the site needs to build (Astro, plugins, etc.):

```bash
npm install
```

Takes 30-90 seconds. You'll see "added X packages" when done. Ignore any vulnerability warnings — don't run `npm audit fix --force`, it can break the project.

### H. Verify everything works

```bash
npm run dev
```

You should see Astro start up and print a Local URL like `http://localhost:4321/`. Open it in your browser to see the site running locally. Hit **Ctrl+C** in the terminal to stop the server.

If you got the local URL — **you're fully set up!** From now on, you'll only follow the steps below for each update.

---

## 1. Open terminal and go to the project folder

```bash
cd ~/Projects/shendurelab.github.io
```

*If you set up the project in a different folder, use that path instead.*

*Tip: if you forget the path, type `cd ` (with trailing space) and drag the folder from Finder onto the terminal window.*

---

## 2. Make sure you're up to date with GitHub

```bash
git checkout main          # switch to main branch
git pull                   # pull latest changes from GitHub
git status                 # should say "working tree clean"
```

If `git status` shows uncommitted changes you don't recognize, stop and ask before proceeding.

---

## 3. Create a new branch for this update

Use a short, descriptive name (no spaces — use dashes):

```bash
git checkout -b your-update-name
```

Examples: `update-rotation-students`, `add-nature-paper`, `fix-homepage-typo`

Confirm:
```bash
git branch                 # should show * your-update-name
```

---

## 4. Start the local preview server

**Before launching Claude Code, open a second terminal tab/window** (Cmd+T in Terminal for a new tab) and run:

```bash
cd ~/Projects/shendurelab.github.io
npm run dev
```

This starts a local copy of the website that auto-refreshes as you make edits. You'll see a URL printed in the terminal — usually something like:

```
 ➜  Local:   http://localhost:4321/
```

Open that URL in your browser. Leave this terminal tab running in the background. As Claude Code makes changes, the browser will auto-reload so you can see edits live.

*Tip: Keep this terminal tab visible in a small window so you can glance at it for errors.*

---

## 5. Launch Claude Code

Go back to your **first** terminal tab (the one in the project folder) and run:

```bash
claude
```

---

## 6. Tell Claude what to change

Describe the update in plain English. Good prompts include:
- What to change
- Where to find new files (if any) with full path
- "Show me the diff before saving"

**Example prompts:**

> *"Update Val Lynch's photo in the rotation students section. The new photo is at `public/images/lab/Lynch_Val2.jpg`. Find the current reference, update it, and show me the diff before saving."*

> *"Add a new publication to the publications page: [full citation]. Follow the existing formatting pattern. Show me the diff before saving."*

> *"There's a typo on the homepage — 'sequencing' is misspelled as 'sequencign'. Find and fix it."*

Review each diff Claude shows you. Approve or reject.

---

## 7. Check the change in your browser

Flip over to the browser tab running `http://localhost:4321/` (from step 4). The page should auto-reload with Claude's changes applied. Navigate to the section you edited and confirm it looks right.

If something looks off, go back to Claude Code and tell it what to fix — no need to exit or restart anything.

---

## 8. Commit, push, open a PR

Once you're happy with how it looks in the browser, back in Claude Code paste:

> *"Commit these changes with message '[short description]', push the branch, and open a pull request against main."*

Claude will run the git commands and give you a PR link.

**Or do it manually:**
```bash
git add .
git commit -m "Short description of change"
git push -u origin your-update-name
gh pr create --base main --fill
```

---

## 9. Review and merge the PR

1. Open the PR link Claude gave you
2. Click the **Files changed** tab and review the diff
3. If needed, add your boss as a reviewer (right sidebar → Reviewers)
4. When approved, click **Merge pull request** → **Confirm merge**
5. Click **Delete branch** on the PR page to clean up

---

## 10. Wait for GitHub Pages to deploy

**Important: merging the PR does NOT mean the site is updated yet.** GitHub has to rebuild and redeploy the site, which takes a few minutes. Don't expect to see changes on the live site immediately.

Go to the Actions tab to check deploy status:
https://github.com/shendurelab/shendurelab.github.io/actions

Look at the **most recent workflow run** at the top of the list. The icon next to it tells you what's happening:

| Icon | Meaning | What to do |
|---|---|---|
| 🟡 **Yellow spinning circle** | Deploy is still running | Wait — usually 1-3 minutes total |
| ✅ **Green checkmark** | Deploy succeeded | Continue to refresh the live site |
| ❌ **Red X** | Deploy failed | Click into it, find the error, and fix it (see Troubleshooting) |

**Once you see the green checkmark**, open the live site and hard-refresh to bypass your browser cache:
- Mac: **Cmd+Shift+R**
- If still showing old content: try an **incognito/private window**

Live site: https://shendurelab.github.io/

Navigate to the specific section you updated and confirm your change is visible.

---

## 11. Clean up locally

Stop the dev server first — go to the terminal tab running `npm run dev` and hit **Ctrl+C**.

Then in your project terminal:

```bash
git checkout main
git pull
git branch -d your-update-name
```

You're done! Ready for the next update.

---

## Quick Troubleshooting

| Problem | Fix |
|---|---|
| Can't find project folder in Finder | Press **Cmd+Shift+H** to go home, then open `Projects/shendurelab.github.io`. Drag it to your Finder sidebar for quick access. |
| `cd` can't find the folder | Use drag-and-drop from Finder into terminal |
| `git pull` says you have conflicts | Run `git status` and share the output — don't force anything |
| Branch name error | No spaces — use dashes: `update-rotation-students` |
| Can't paste path into terminal | Use **Cmd+V** on Mac |
| `npm run dev` errors out | Try `npm install` first, then `npm run dev` again |
| `astro: command not found` | Project is in a cloud-synced folder (iCloud/Dropbox/OneDrive) — clone a fresh copy into `~/Projects/` and run `npm install` |
| Browser shows "can't connect to localhost" | The dev server stopped — restart with `npm run dev` |
| Browser doesn't auto-refresh after Claude edits | Manually refresh the browser tab (Cmd+R) |
| Edits don't appear on GitHub | You forgot to commit and push — Claude can do this for you, see step 8 |
| Merged PR but live site still shows old version | Check Actions tab — deploy usually takes 1-3 min after merge |
| Actions shows green but live site still old | Hard-refresh with **Cmd+Shift+R**, or try incognito window |
| Actions shows red X | Click the failed run → click the failed step → scroll up from "exit code 1" to find the real error |
| Accidentally committed to `main` | Stop and ask — don't push yet |

---

## Golden Rules

1. **Never edit directly on `main`** — always create a branch first
2. **Always open a PR** — even for tiny changes, so there's a record
3. **Drop new files (images, PDFs) into your local folder**, never upload them through GitHub.com
4. **Keep `npm run dev` running** in a second terminal tab so you see changes live
5. **Ask Claude to show diffs before saving** — easier to catch mistakes
6. **Hard-refresh** (Cmd+Shift+R) after deploy to bypass browser cache
7. **Never work in a cloud-synced folder** (iCloud/Dropbox/OneDrive/Google Drive) — your project must live in a plain local folder like `~/Projects/`
