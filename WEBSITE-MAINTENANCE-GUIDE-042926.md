# Shendure Lab Website Maintenance Guide

This guide explains how to update the Shendure Lab website. The site is built with Astro and uses JSON/Markdown files for content, making updates straightforward without needing to edit HTML.

The site is hosted on GitHub Pages and lives in the `shendurelab/shendurelab.github.io` repository. All updates flow through GitHub: edit locally, push to a branch, open a pull request, merge, and GitHub Pages auto-deploys to https://shendurelab.github.io/.

**Easiest Option:** If you have access to Claude Code, you can simply describe what you want in plain English and it will make the changes for you. See [Using Claude Code](#using-claude-code-recommended) below.

---

## Where things live (read this once)

You'll work with **two folders** that contain copies of the website:

| Where | What it is | Use it for |
|---|---|---|
| **GitHub** (https://github.com/shendurelab/shendurelab.github.io) | The master copy in the cloud — what gets deployed to the live site | Reviewing PRs, watching deploy status. Don't upload files directly here. |
| **Your local folder** (`~/Projects/shendurelab.github.io`) | A copy on your laptop you can edit and preview | All editing, all file drops (images, PDFs), all Claude Code work |

**The flow:** edit your local folder → push to GitHub via PR → GitHub Actions deploys to live site. Never edit on GitHub directly through the web interface — you'd skip local preview, skip Claude Code, and break the workflow.

The local folder is created by cloning the repo from GitHub (see [First-Time Setup](#first-time-setup)). It must live in a plain local folder like `~/Projects/` — not in any cloud-synced folder (iCloud Drive, Dropbox, OneDrive, Google Drive), which corrupts the build files. GitHub itself is your backup, so you don't need a separate cloud copy.

### Where to drop new files (always into your local folder):

| File type | Drop into |
|---|---|
| Lab member photos | `public/images/lab/` |
| Publication thumbnails | `public/images/papers/` |
| Fun page photos | `public/images/fun/` |
| Press article images | `public/images/press/` |
| PDFs (papers, etc.) | `public/documents/` |

You can drag-and-drop straight from Finder. Then commit and push them through the normal PR workflow.

### File size guidance

Git handles small/medium files well, but struggles with very large ones:

- **Images:** keep under ~1MB. Compress in Photoshop ("Save for Web") or https://tinypng.com
- **PDFs:** keep under ~5MB. For larger files, link to bioRxiv or the journal site instead of hosting locally
- **Hard limit:** GitHub rejects files over 100MB. Files over 25MB will trigger warnings.

---

## Table of Contents

1. [Where Things Live](#where-things-live-read-this-once)
2. [First-Time Setup](#first-time-setup)
3. [Standard Update Workflow](#standard-update-workflow)
4. [Using Claude Code (Recommended)](#using-claude-code-recommended)
5. [Project Structure](#project-structure)
6. [Adding New Lab Members](#adding-new-lab-members)
7. [Moving Lab Members to Alumni](#moving-lab-members-to-alumni)
8. [Managing Publications](#managing-publications)
9. [Updating Research Areas](#updating-research-areas)
10. [Updating Press/News](#updating-pressnews)
11. [Updating Upcoming Lab Meetings](#updating-upcoming-lab-meetings)
12. [Updating the Fun Page](#updating-the-fun-page)
13. [Updating Resources, Support, Contact](#updating-resources-support-contact)
14. [Building and Deploying](#building-and-deploying)
15. [Troubleshooting](#troubleshooting)
16. [Quick Reference](#quick-reference)

---

## First-Time Setup

Complete these steps once on each computer you'll use to update the site. Skip to [Standard Update Workflow](#standard-update-workflow) if you're already set up.

### A. Get access to the right accounts

You'll need:

1. **A Shendure Lab Claude account** — talk to the lab PI or admin to get added to the lab's Claude Team workspace. This gives you Claude Code access.
2. **A GitHub account that's a member of the `shendurelab` organization** — the PI or org admin needs to invite you with at least **Write** permission on the `shendurelab.github.io` repo. You can confirm membership at https://github.com/orgs/shendurelab/people.

### B. Install required tools

Open Terminal and run each command. If a tool is already installed, it'll just print a version number — that's fine, move to the next.

```bash
# Check git (comes with Mac developer tools)
git --version

# If not installed, install Apple's developer tools (also gives you many other useful CLI utilities):
xcode-select --install

# Install Homebrew if you don't have it (https://brew.sh/) — needed for the next steps
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install GitHub CLI
brew install gh

# Install Node.js (needed for npm and the Astro build)
brew install node

# Install Claude Code
curl -fsSL https://claude.ai/install.sh | bash
```

After running each install, **close and reopen Terminal** so the new commands are available on your PATH.

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

It'll prompt you to log in. Choose the option for your paid plan, authenticate via browser using your **Shendure Lab Claude account**, then return to Terminal.

### F. Clone the website repo (download a local copy)

Clone the repo into a plain local folder like `~/Projects/`. Do NOT use iCloud Drive, Dropbox, OneDrive, Google Drive, or any other cloud-synced folder — they corrupt the build files (`astro: command not found` errors). GitHub is your backup, so a separate cloud copy isn't needed.

```bash
mkdir -p ~/Projects
cd ~/Projects
gh repo clone shendurelab/shendurelab.github.io
cd shendurelab.github.io
```

### G. Install the website's dependencies

This downloads every package the site needs to build (Astro, plugins, etc.) into a `node_modules` folder:

```bash
npm install
```

Takes 30–90 seconds. You'll see "added X packages" when done. **Ignore any vulnerability warnings** — do NOT run `npm audit fix --force`, as it can break the project by upgrading to incompatible package versions.

### H. Verify everything works

```bash
npm run dev
```

You should see Astro start up and print a Local URL like `http://localhost:4321/`. Open it in your browser to confirm the site is running locally. Hit **Ctrl+C** in the terminal to stop the server.

If you got the local URL — **you're fully set up!** From now on, follow the [Standard Update Workflow](#standard-update-workflow) below for each update.

---

## Standard Update Workflow

Follow this every time you want to push a change to the live site. The pattern: branch → edit → preview → push → PR → merge → deploy.

### 1. Open terminal and go to the project folder

```bash
cd ~/Projects/shendurelab.github.io
```

### 2. Sync with GitHub

```bash
git checkout main          # switch to main branch
git pull                   # pull latest changes from GitHub
git status                 # should say "working tree clean"
```

If `git status` shows uncommitted changes you don't recognize, stop and ask before proceeding.

### 3. Create a new branch for this update

Use a short, descriptive name (no spaces — use dashes):

```bash
git checkout -b your-update-name
```

Examples: `update-rotation-students`, `add-nature-paper`, `fix-homepage-typo`

### 4. Start the local preview server

**Open a second terminal tab** (Cmd+T) and run:

```bash
cd ~/Projects/shendurelab.github.io
npm run dev
```

Open the URL it prints (usually `http://localhost:4321/`) in your browser. Leave this tab running — the page auto-refreshes as you make edits.

### 5. Launch Claude Code (in your first terminal tab)

```bash
claude
```

### 6. Tell Claude what to change

Describe the update in plain English. Always include "Show me the diff before saving" so you can review changes before they're applied.

See [Using Claude Code](#using-claude-code-recommended) below for example prompts.

### 7. Check the change in your browser

Flip to your `localhost:4321` browser tab — it should auto-reload with Claude's changes. Navigate to the section you edited and confirm it looks right. If something's off, tell Claude what to fix without exiting.

### 8. Commit, push, open a PR

In Claude Code, paste:

> *"Commit these changes with message '[short description]', push the branch, and open a pull request against main."*

Or run manually:

```bash
git add .
git commit -m "Short description of change"
git push -u origin your-update-name
gh pr create --base main --fill
```

### 9. Review and merge the PR

1. Open the PR link Claude gives you
2. Click the **Files changed** tab and review the diff
3. Add the PI as a reviewer if appropriate (right sidebar → Reviewers)
4. When approved, click **Merge pull request** → **Confirm merge** → **Delete branch**

### 10. Wait for GitHub Pages to deploy

> Merging the PR does NOT instantly update the live site. GitHub has to rebuild and redeploy, which takes a few minutes.

Check the Actions tab: https://github.com/shendurelab/shendurelab.github.io/actions

| Icon | Meaning | What to do |
|---|---|---|
| 🟡 Yellow spinning circle | Deploy is still running | Wait — usually 1–3 minutes |
| ✅ Green checkmark | Deploy succeeded | Refresh the live site |
| ❌ Red X | Deploy failed | Click into it, find the error, and fix |

When green, hard-refresh https://shendurelab.github.io/ with **Cmd+Shift+R** to bypass browser cache.

### 11. Clean up locally

Stop the dev server (Ctrl+C in the second tab), then in your project terminal:

```bash
git checkout main
git pull
git branch -d your-update-name
```

You're ready for the next update.

---

## Using Claude Code (Recommended)

If you have access to **Claude Code** (Anthropic's AI coding assistant), you can update the website by simply describing what you want in plain English. Claude Code reads the project files, understands the structure, and makes changes for you.

### Starting Claude Code

1. Open Terminal
2. Navigate to the project folder:
   ```bash
   cd ~/Projects/shendurelab.github.io
   ```
3. Start Claude Code:
   ```bash
   claude
   ```

### Example Prompts for Common Tasks

Just type these (or similar) requests and Claude Code will handle the rest. Always end your prompt with *"Show me the diff before saving."*

#### Adding a New Lab Member
```
Add a new lab member: Jane Doe, Graduate Student, email jdoe@uw.edu.
Her photo is at /images/lab/doe.jpg
```

#### Moving Someone to Alumni
```
Move Troy McDiarmid to Alumni. His dates in the lab were 2021-2026
and his current position is Assistant Professor at University of British Columbia.
Here's the link: https://bme.ubc.ca/?directory=troy-mcdiarmid
```

#### Updating a Photo
```
I want to update Valeri Lynch's photo in the rotation students section.
The new photo is at public/images/lab/Lynch_Val2.jpg.
Find the current reference, update it, and show me the diff before saving.
```

#### Adding a New Publication
```
Add a new research paper:
- Title: "Paper title here"
- Authors: Doe, Smith et al.
- Journal: Nature
- Year: 2026
- PMID: 12345678
- Article URL: https://nature.com/articles/xxxxx
- The thumbnail is at /images/papers/Doe_Nature_2026_thumb.png
- PDF is at /documents/Doe_Nature_2026.pdf
```

#### Moving a Preprint to Published
```
The preprint "Paper title" by Doe et al. has been published in Nature.
Move it from preprints to research articles. The PMID is 12345678.
```

#### Updating Lab Meetings
```
Update the lab meeting schedule:
- Jan 27: David, Sarah, Mike presenting
- Feb 3: NO MEETING
- Feb 10: Lisa, Tom, Anna presenting
All meetings are in S110 and zoom, 1:30p-3:30p
```

#### Adding Press/News
```
Add a new press item: Nature published an article about our lineage tracing work
on January 15, 2026. The headline is "Scientists trace cell lineages"
and the URL is https://nature.com/news/article
```

#### Updating Contact Information
```
Update the lab manager contact on the Contact page.
The new lab manager is John Smith, email jsmith@uw.edu
```

#### General Questions
```
How do I add a new research area to the website?
Show me all the current lab members
What publications are currently listed as preprints?
```

### Tips for Working with Claude Code

1. **Be specific**: Include all the details (names, dates, URLs, file paths)
2. **One task at a time**: For complex updates, break them into separate requests
3. **Ask to see diffs**: End prompts with "show me the diff before saving" so you can review
4. **Reference this guide**: You can tell Claude:
   ```
   Read the WEBSITE-MAINTENANCE-GUIDE.md and help me add a new lab member
   ```
5. **Batch updates**: You can request multiple related changes:
   ```
   Add these 3 new publications to the research articles: [list details]
   ```

### What Claude Code Can Do

- Create and edit JSON files for people and publications
- Update page content (press, upcoming, research areas, etc.)
- Preview changes locally
- Build the site for deployment
- Run git commands (commit, push, branch, open PRs)
- Answer questions about the codebase
- Troubleshoot issues

> **Note:** Both `npm run dev` and `npm run build` automatically run two scripts before starting: (1) auto-categorize new research papers for animations, and (2) regenerate the search index from all people, publications, and news data. You never need to run these manually.

### What You Still Need to Do Manually

- **Add image files**: Copy photos/thumbnails to the correct folders in `public/images/`
- **Add PDF files**: Copy PDFs to `public/documents/`
- **Merge PRs on GitHub**: Claude can open them but you (or a reviewer) need to click Merge

You can ask Claude Code where to put files:
```
Where should I save the photo for a new lab member named Jane Doe?
```

---

## Project Structure

### Project Location
```
~/Projects/shendurelab.github.io/
```

### Key Folders
```
src/
├── content/
│   ├── people/          # Lab member JSON files
│   ├── publications/    # Publication JSON files
│   └── animations.json  # Animation-to-paper mappings
├── pages/
│   ├── people/          # People page templates
│   ├── publications/    # Publication page templates
│   ├── press/           # Press/news pages
│   ├── research.astro   # Research areas page
│   ├── upcoming.astro   # Lab meetings page
│   ├── fun.astro        # Fun/photos page
│   └── contact.astro    # Contact page
└── styles/
    └── global.css       # Global styles

public/
├── images/
│   ├── lab/             # Lab member photos
│   ├── papers/          # Publication thumbnails
│   ├── fun/             # Fun page photos
│   └── press/           # Press article images
└── documents/           # PDFs (papers, etc.)

scripts/
├── auto-categorize-papers.js  # Auto-categorizes new publications
└── update-search.cjs          # Auto-generates search index from people/publications/news

.github/workflows/      # GitHub Actions for auto-deployment
```

### Preview Changes Locally
```bash
cd ~/Projects/shendurelab.github.io
npm run dev
```
Then open http://localhost:4321 in your browser (port may vary — check terminal output).

> This automatically categorizes new papers and updates search data before starting the server.

---

## Adding New Lab Members

### Step 1: Add Photo
1. Get a photo of the new lab member
2. **Crop it in Photoshop** to a square (1:1 ratio), centered on the face with some space above the head and below the shoulders. Resize to ~400x400px.
3. Save it to: `public/images/lab/lastname.jpg`

> **No photo yet?** Use the Foege building image as a placeholder: set `"photo": "/images/William-H-Foege-Genome-Sciences-GNOM.jpg"`. Replace it with a real photo later.

### Step 2: Create JSON File
Create a new file in `src/content/people/` named `firstname-lastname.json`:

```json
{
  "name": "Jane Doe",
  "slug": "jane-doe",
  "photo": "/images/lab/doe.jpg",
  "title": "Graduate Student",
  "role": "graduate-student",
  "email": "jdoe@uw.edu",
  "status": "current"
}
```

### Available Roles
- `pi` - Principal Investigator
- `postdoc` - Postdoctoral Fellow
- `graduate-student` - Graduate Student
- `research-scientist` - Research Scientist
- `staff` - Staff
- `undergraduate` - Undergraduate
- `visiting` - Visiting Scientist
- `rotation` - Rotation Student

### Optional Fields
```json
{
  "website": "https://personal-site.com",
  "twitter": "@handle",
  "github": "username",
  "orcid": "0000-0000-0000-0000",
  "googleScholar": "scholar-id"
}
```

### Step 3: Search Index (Automatic)
The search index updates automatically when you run `npm run dev` or `npm run build`. No manual step needed — new lab members will appear in search results immediately.

---

## Moving Lab Members to Alumni

### Step 1: Edit the Person's JSON File
Open their file in `src/content/people/` and update these fields:

[The rest of this section preserved from the original guide — see your existing content for details]

---

## Managing Publications, Research Areas, Press/News, Lab Meetings, Fun Page, Resources/Support/Contact

[Sections preserved from the original guide — see your existing content for details]

---

## Building and Deploying

The site auto-deploys via GitHub Actions whenever code is merged to the `main` branch. You don't need to run any deploy commands manually — just merge a PR and wait.

### Preview Locally
```bash
npm run dev
```

### Manual Build (rarely needed)
```bash
npm run build
```
This creates a `dist/` folder with static HTML files. The CI handles this automatically on every push.

### Watching Deploy Status
After merging to `main`, watch progress at:
https://github.com/shendurelab/shendurelab.github.io/actions

Wait for the green checkmark, then hard-refresh https://shendurelab.github.io/ (Cmd+Shift+R) to see updates.

---

## Troubleshooting

### Common Issues

**"File not found" errors:**
- Check that file paths in JSON match actual file locations
- Paths should start with `/` (e.g., `/images/lab/photo.jpg`)

**Changes not appearing locally:**
- Make sure you saved the file
- Restart the dev server (`npm run dev`)
- Clear browser cache (Cmd+Shift+R)

**Build errors:**
- Check JSON files for syntax errors (missing commas, quotes)
- Use a JSON validator: https://jsonlint.com/

**Images not displaying:**
- Verify the image exists in `public/images/`
- Check the path in the JSON file matches exactly (case-sensitive)

**`astro: command not found`:**
- Project may be in a cloud-synced folder (iCloud/Dropbox/OneDrive/Google Drive), which corrupts symlinks
- Clone a fresh copy from GitHub into `~/Projects/` and run `npm install`

**`cd` can't find folder:**
- Drag the folder from Finder onto the terminal window after typing `cd `

**Branch name error:**
- No spaces in branch names — use dashes (e.g., `update-rotation-students`)

**Merged PR but live site still shows old version:**
- Check Actions tab — deploy usually takes 1–3 minutes after merge
- Hard-refresh with Cmd+Shift+R, or try an incognito window

**Actions shows red X (deploy failed):**
- Click the failed run → click the failed step → scroll up from "exit code 1" to find the real error message
- Common cause: a bug in the code (e.g., missing import, JSON syntax error). Run `npm run build` locally to reproduce and have Claude Code fix it.

**Accidentally committed to `main`:**
- Stop and ask the PI/admin — don't push yet

### Re-enabling Animations

Animations were commented out on 3/23/2026 per Jay's request. All code is preserved and ready to be turned back on. To re-enable:

**In each of these 4 files, uncomment the import line and the component block:**

1. **`src/pages/index.astro`** (Homepage)
   - Uncomment: `// import DNAAnimation from '../components/special/DNAAnimation.astro';`
   - Uncomment: `<!-- <DNAAnimation ... /> -->`

2. **`src/pages/research.astro`** (Research page)
   - Uncomment: `// import DNAAnimation from '../components/special/DNAAnimation.astro';`
   - Uncomment: `<!-- <div class="research-animation ..."><DNAAnimation ... /></div> -->`

3. **`src/pages/resources/index.astro`** (Resources page)
   - Uncomment: `// import DNAAnimation from '../../components/special/DNAAnimation.astro';`
   - Uncomment: `<!-- <div class="hidden md:block"><DNAAnimation ... /></div> -->`

4. **`src/pages/publications/index.astro`** (Publications page)
   - Uncomment: `// import DNAAnimation from '../../components/special/DNAAnimation.astro';`
   - Uncomment: `<!-- <div class="hidden md:block"><DNAAnimation ... /></div> -->`

**Or with Claude Code**, just say:
```
Uncomment the animation code in all 4 pages to re-enable animations
```

All supporting files are still in place and don't need changes:
- `src/components/special/DNAAnimation.astro` — the animation component
- `src/content/animations.json` — paper-to-animation mappings (107 research articles)
- `scripts/auto-categorize-papers.js` — auto-categorization for new papers

### Testing a Specific Animation

[Preserved from original guide — see existing content]

### Getting Help
- Check existing similar files for reference
- Review this guide
- Ask Claude Code: `"How do I [task]?"`
- Contact the previous maintainer

---

## Quick Reference

### Setup (once per computer)
| Step | Command |
|------|---------|
| Install GitHub CLI | `brew install gh` |
| Install Node.js | `brew install node` |
| Install Claude Code | `curl -fsSL https://claude.ai/install.sh \| bash` |
| Authenticate GitHub | `gh auth login` |
| Authenticate Claude | `claude` (then follow prompts) |
| Clone repo | `gh repo clone shendurelab/shendurelab.github.io` |
| Install dependencies | `npm install` |

### Every update
| Step | Command |
|------|---------|
| Go to project | `cd ~/Projects/shendurelab.github.io` |
| Sync with GitHub | `git checkout main && git pull` |
| Make a branch | `git checkout -b update-name` |
| Start preview (new tab) | `npm run dev` |
| Edit with Claude | `claude` |
| Commit & push (via Claude) | "commit, push, and open PR" |
| Merge & deploy | Click Merge on GitHub PR page |

### Files to edit by task
| Task | File(s) to Edit |
|------|----------------|
| Add lab member | `src/content/people/firstname-lastname.json` |
| Move to alumni | Edit existing file in `src/content/people/` |
| Move rotation student to alumni | Delete JSON, add to list in `alumni.astro` + `update-search.cjs` |
| Add publication | `src/content/publications/author-year-title.json` |
| Add to animations | Run `node scripts/auto-categorize-papers.js` |
| Update search index | Automatic on `npm run dev` / `npm run build` |
| Update research areas | `src/pages/research.astro` |
| Add press item | `src/pages/press/index.astro` or `all.astro` |
| Update lab meetings | `src/pages/upcoming.astro` |
| Add fun photos | `src/pages/fun.astro` |
| Update support/funding | `src/pages/support.astro` |
| Update contact info | `src/pages/contact.astro` |

---

*Last updated: April 2026*
