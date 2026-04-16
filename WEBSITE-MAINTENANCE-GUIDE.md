# Shendure Lab Website Maintenance Guide

This guide explains how to update the Shendure Lab website. The site is built with Astro and uses JSON/Markdown files for content, making updates straightforward without needing to edit HTML.

**Easiest Option:** If you have access to Claude Code, you can simply describe what you want in plain English and it will make the changes for you. See [Using Claude Code](#using-claude-code-recommended) below.

## Table of Contents

1. [Using Claude Code (Recommended)](#using-claude-code-recommended)
2. [Getting Started (Manual Editing)](#getting-started)
3. [Adding New Lab Members](#adding-new-lab-members)
4. [Moving Lab Members to Alumni](#moving-lab-members-to-alumni)
5. [Managing Publications](#managing-publications)
6. [Updating Research Areas](#updating-research-areas)
7. [Updating Press/News](#updating-pressnews)
8. [Updating Upcoming Lab Meetings](#updating-upcoming-lab-meetings)
9. [Updating the Fun Page](#updating-the-fun-page)
10. [Updating Resources, Support, Contact](#updating-resources-support-contact)
11. [Building and Deploying](#building-and-deploying)
12. [Troubleshooting](#troubleshooting)

---

## Using Claude Code (Recommended)

If you have access to **Claude Code** (Anthropic's AI coding assistant), you can update the website by simply describing what you want in plain English. Claude Code can read the project files, understand the structure, and make changes for you.

### Starting Claude Code

1. Open Terminal
2. Navigate to the project folder:
   ```bash
   cd "~/Dropbox/Docs_Olga/Shendure Website (re)design 2026-project"
   ```
3. Start Claude Code:
   ```bash
   claude
   ```

### Example Prompts for Common Tasks

Just type these (or similar) requests and Claude Code will handle the rest:

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
```

```
Show me all the current lab members
```

```
What publications are currently listed as preprints?
```

### Tips for Working with Claude Code

1. **Be specific**: Include all the details (names, dates, URLs, file paths)

2. **One task at a time**: For complex updates, break them into separate requests

3. **Verify changes**: After Claude makes changes, you can ask:
   ```
   Show me what you changed
   ```
   or
   ```
   Preview the website locally
   ```

4. **Ask for help**: If you're unsure how to do something:
   ```
   How do I update the research areas page?
   ```

5. **Reference this guide**: You can tell Claude to use this documentation:
   ```
   Read the WEBSITE-MAINTENANCE-GUIDE.md and help me add a new lab member
   ```

6. **Batch updates**: You can request multiple related changes:
   ```
   Add these 3 new publications to the research articles: [list details]
   ```

### What Claude Code Can Do

- Create and edit JSON files for people and publications
- Update page content (press, upcoming, research areas, etc.)
- Preview changes locally
- Build the site for deployment
- Answer questions about the codebase
- Troubleshoot issues

> **Note:** Both `npm run dev` and `npm run build` automatically run two scripts before starting: (1) auto-categorize new research papers for animations, and (2) regenerate the search index from all people, publications, and news data. You never need to run these manually.

### What You Still Need to Do Manually

- **Add image files**: Copy photos/thumbnails to the correct folders in `public/images/`
- **Add PDF files**: Copy PDFs to `public/documents/`
- **Deploy to server**: Run the rsync command or upload files

You can ask Claude Code where to put files:
```
Where should I save the photo for a new lab member named Jane Doe?
```

---

## Getting Started

### Project Location
```
~/Dropbox/Docs_Olga/Shendure Website (re)design 2026-project/
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
```

### Preview Changes Locally
```bash
cd "~/Dropbox/Docs_Olga/Shendure Website (re)design 2026-project"
npm run dev
```
Then open http://localhost:4321 in your browser (port may vary if 4321 is in use — check the terminal output).

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

**Before (Current Member):**
```json
{
  "name": "Troy McDiarmid",
  "slug": "troy-mcdiarmid",
  "photo": "/images/lab/mcdiarmid1.jpg",
  "title": "Postdoctoral Fellow",
  "role": "postdoc",
  "email": "troym13@uw.edu",
  "status": "current"
}
```

**After (Alumni):**
```json
{
  "name": "Troy McDiarmid",
  "slug": "troy-mcdiarmid",
  "photo": "/images/lab/mcdiarmid1.jpg",
  "title": "Postdoctoral Fellow",
  "role": "postdoc",
  "status": "alumni",
  "startYear": 2021,
  "endYear": 2026,
  "sortOrder": 1,
  "currentPosition": "Assistant Professor, University of British Columbia",
  "currentPositionUrl": "https://bme.ubc.ca/?directory=troy-mcdiarmid"
}
```

### Key Changes:
1. Change `"status": "current"` → `"status": "alumni"`
2. Remove `email` (optional, but recommended for privacy)
3. Add `startYear` and `endYear`
4. Add `sortOrder` (lower numbers appear first; most recent alumni should have the lowest number)
5. Add `currentPosition` and optionally `currentPositionUrl`

### Updating Sort Order
Alumni are displayed in reverse chronological order. The person who left most recently should have `sortOrder: 1`. You may need to increment existing alumni's sortOrder values.

### Moving a Rotation Student to Alumni

Rotation students are handled differently from other lab members. Instead of keeping an individual JSON file, they go into the **"Past Rotation Students"** list at the bottom of the Alumni page.

**Steps:**
1. **Delete** their JSON file from `src/content/people/` (e.g., `monica-moni-padilla-galvez.json`)
2. **Add them** to the Past Rotation Students list in `src/pages/people/alumni.astro` — add a new entry at the **top** of the array (most recent first):
   ```javascript
   { name: 'Monica (Moni) Padilla Galvez', program: 'GS', period: 'Winter 2026' },
   ```
3. **Add them** to the rotation students list in `scripts/update-search.cjs` so they appear in search results:
   ```javascript
   { name: "Monica (Moni) Padilla Galvez", title: "Rotation Student (GS), Winter 2026" },
   ```
4. **Search data** updates automatically on next `npm run dev` or `npm run build`.

> **Note:** The Alumni page has three sections: (1) the main **Alumni grid** with photo cards (for postdocs, grad students, staff, etc.), (2) **Other Alumni** text list (undergrads, visiting scientists, volunteers), and (3) **Past Rotation Students** text list. All three sections are searchable — searching for any name will navigate to the Alumni page and highlight that person.

---

## Managing Publications

### Publication Categories
- **research** - Featured Research Articles
- **review** - Featured Review Articles
- **preprint** - Featured Preprints
- **pre2007** - Pre-2007 Publications

### Adding a New Publication

#### Step 1: Add Thumbnail Image
Save the journal cover or paper thumbnail to the `public/images/papers/` folder.

**File location:**
```
public/images/papers/AuthorName_Journal_Year_thumb.png
```

**Full path on your computer:**
```
~/Dropbox/Docs_Olga/Shendure Website (re)design 2026-project/public/images/papers/
```

**Naming convention:** `AuthorName_Journal_Month Year_thumb.png`
- Example: `Nathans_NatureProtocols_February2026_thumb.png`

#### Step 2: Add PDF (if available)
Save the PDF to the `public/documents/` folder.

**File location:**
```
public/documents/AuthorName_Journal_Year.pdf
```

**Full path on your computer:**
```
~/Dropbox/Docs_Olga/Shendure Website (re)design 2026-project/public/documents/
```

**Naming convention:** `AuthorName_Journal_Year.pdf`
- Example: `Nathans_NatureProtocols_2026.pdf`

> **Important:** Files MUST be in the `public/` folder to be accessible on the website. The paths in the JSON file (like `/images/papers/...`) are relative to the `public/` folder.

#### Step 3: Create JSON File
Create a new file in `src/content/publications/` named `author-year-short-title.json`:

```json
{
  "category": "research",
  "articleUrl": "https://www.nature.com/articles/xxxxx",
  "thumbnail": "/images/papers/Doe_Nature_2026_thumb.png",
  "pdfUrl": "/documents/Doe_Nature_2026.pdf",
  "citation": "Doe, Smith et al. Paper title here. Nature (2026)",
  "year": 2026,
  "journal": "Paper title here. Nature",
  "pmid": "12345678",
  "slug": "doe-2026-paper-title-here",
  "sortOrder": 1
}
```

#### Step 4: Animation Rotation (Automatic for Research Articles)

> **ANIMATIONS CURRENTLY DISABLED (3/23/26):** Per Jay's request, all animation code has been commented out as of 3/23/2026. The website is being published without animations first to replace the current website and accommodate ADA compliance (deadline: 4/24/26). More work is to be done on animations at a later date. All animation code is preserved — see [Re-enabling Animations](#re-enabling-animations) below for instructions on how to turn them back on.

**Note:** Only Featured Research Articles (`"category": "research"`) appear in the homepage corner animations. Reviews, preprints, and pre-2007 papers are NOT included.

**This step is now automatic.** The auto-categorization script runs automatically every time you start the dev server (`npm run dev`) or build the site (`npm run build`). It will:
- Scan all publication JSON files in `src/content/publications/`
- Skip any papers already in `animations.json` and any non-research papers
- Analyze new research papers' titles/citations for keywords
- Assign each to one of 13 research animation categories
- Add them to `src/content/animations.json` with an animation type and color variation

You do **not** need to run the script manually or ask Claude Code to run it. Just add the research paper JSON file, and the animation will be created next time you run `npm run dev` or `npm run build`.

To run categorization on its own without starting the server:
```bash
npm run categorize
```

> **Note:** If the script categorizes incorrectly, you can manually edit `src/content/animations.json` to change the `category` and `type` fields. See the category reference below.

**No action needed** for review articles, preprints, and pre-2007 papers — they are automatically skipped.

#### Animation Categories Reference

Each research paper is assigned to one of 13 categories. Each category has a unique animation type that visually represents that area of research. The animations appear in the four corners of the homepage and rotate through papers randomly.

| Category | Animation Type | Visual Description | Example Keywords |
|---|---|---|---|
| single-cell-transcriptomics | wellPlate | Grid of wells (96-well plate) | sci-RNA, single-cell RNA, cell atlas |
| single-cell-chromatin | atacPeaks | Peak profile tracks (ATAC-seq) | sci-ATAC, chromatin accessibility |
| developmental-atlases | cellClusters | Clustered cell groups (UMAP-like) | embryo, gastrulation, organogenesis |
| genome-editing | rnaHairpin | RNA hairpin/stem-loop structure | CRISPR, prime editing, Cas9 |
| molecular-recording | chevrons | Chevron/arrow patterns (tape recorder) | lineage tracing, DNA typewriter, barcode |
| variant-analysis | heatmap | Color gradient grid (mutation map) | saturation mutagenesis, variant effect, BRCA1 |
| regulatory-elements | cisRegulatory | Regulatory element diagram | enhancer, MPRA, cis-regulatory |
| exome-genome-sequencing | dnaHelix | Double helix structure | exome sequencing, genome sequencing, haplotype |
| 3d-genome | hiCLoops | Contact map loops (Hi-C) | Hi-C, chromatin loop, 3D genome |
| cell-free-dna | cellFreeDNA | Floating DNA fragments | cell-free DNA, liquid biopsy, NIPT |
| disease-genetics | scatterPlot | Scattered data points | Mendelian, rare disease, autism, CADD |
| infectious-disease | phyloTree | Phylogenetic tree branches | COVID, SARS-CoV, pathogen, outbreak |
| computational-tools | trajectoryTree | Branching trajectory tree | computational, algorithm, review, perspective |

#### How Auto-Categorization Works

The script (`scripts/auto-categorize-papers.js`) uses keyword matching on the paper's citation text:

1. **Keyword priority:** Categories are checked in a specific order (molecular-recording first, computational-tools last). The first keyword match wins.
2. **Default fallback:** If no keywords match, the paper defaults to `computational-tools`.
3. **Color variation:** Each paper gets a variation number (0–5) based on a hash of its slug, which determines its color palette (blues, warm oranges, cool greens, vibrant mixed, earth tones, or ocean blues) and slight size differences.
4. **Four corners:** The homepage displays 4 animations simultaneously, one in each corner. Each corner picks a different category to ensure visual diversity. Animations rotate to new papers/categories every ~20 seconds.

#### Step 5: Search Index (Automatic)
The search index updates automatically when you run `npm run dev` or `npm run build`. New publications will appear in search results immediately. No manual step needed.

#### Step 6: Add to Research Area (if applicable)
If the paper should appear on a Research Area page (e.g., "Developing New Molecular Methods"), you need to manually add it to the corresponding page:

1. Open the research area file, e.g., `src/pages/research/molecular-methods.astro`
2. Find the `publicationRows` array at the top
3. Add the paper to the appropriate row (newest papers go in the first row):

```javascript
{ image: 'AuthorName_Journal_Year_thumb.png', articleUrl: 'https://...', authors: 'Author et al.', title: 'Paper title', journal: 'Journal Name', year: 2026, pmid: '12345678', pdfFile: 'AuthorName_Journal_Year.pdf' },
```

### Moving Preprint to Published

When a preprint gets published in a journal, there are several things to update. This is especially involved if the first author changed or the year is different.

#### Step 1: Create New Publication JSON (or update existing)
If the first author or year changed, create a **new** file with the correct naming (`author-year-short-title.json`) and delete the old preprint file. Otherwise, edit the existing file in place.

Update these fields:
1. Change `"category": "preprint"` → `"category": "research"` (or `"review"`)
2. Update `articleUrl` to the published version
3. Update `citation` with the journal name (remove bioRxiv reference)
4. Update `year` to the publication year
5. Add `pmid`
6. Add `thumbnail` and `pdfUrl` paths
7. Add `journal` field (format: `"Paper title. Journal Name"`)
8. Set `sortOrder` (use `1` for the most recent paper)

Example:
```json
{
  "category": "research",
  "articleUrl": "https://www.cell.com/...",
  "thumbnail": "/images/papers/Author_Journal_MonthYear_thumb.png",
  "pdfUrl": "/documents/Author_Journal_Year.pdf",
  "citation": "Author et al. Paper title. Journal Name (2026)",
  "year": 2026,
  "journal": "Paper title. Journal Name",
  "pmid": "12345678",
  "slug": "author-2026-short-title",
  "sortOrder": 1
}
```

#### Step 2: Update Animation (if moving to research category)
**Note:** Only Featured Research Articles (`"category": "research"`) appear in the homepage corner animations. Reviews, preprints, and pre-2007 papers are NOT included in animations.

If the paper is now a **research** article and had an existing animation entry in `src/content/animations.json`, update the `paperSlug` and `name` to match the new file. If it didn't have an animation entry yet, run `node scripts/auto-categorize-papers.js` to create one.
```json
{
  "name": "Author, 2026, Category Name",
  "paperSlug": "author-2026-short-title"
}
```

#### Step 3: Add to Research Area Page (if applicable)
Add the paper to the relevant research area page in `src/pages/research/` (e.g., `functional-genomics.astro`). Add it as a new entry in the first row of `publicationRows`.

#### Step 4: Search Index (Automatic)
Search data updates automatically on next `npm run dev` or `npm run build`.

### Sort Order for Publications
Within each category, publications are sorted by `sortOrder` (ascending). Lower numbers appear first. Typically:
- Most recent/featured papers: `sortOrder: 1-10`
- Older papers: higher numbers

---

## Updating Research Areas

Research areas are defined in `src/pages/research.astro`.

### Current Research Areas:
1. Developing New Molecular Methods
2. Genomic Approaches to Developmental Biology
3. Massively Parallel Functional Genomics
4. Translating Genomics to the Clinic
5. Genetic Basis of Human Disease
6. Genome Sequencing Technology

### To Update Research Area Content:
Edit `src/pages/research.astro` and find the `researchAreas` array:

```javascript
const researchAreas = [
  {
    title: "Developing New Molecular Methods",
    description: "Description text here...",
    papers: ["paper-slug-1", "paper-slug-2"]
  },
  // ... more areas
];
```

### To Add a Paper to a Research Area:
1. Find the research area in the array
2. Add the paper's slug to the `papers` array

---

## Updating Press/News

Press items are stored in `src/pages/press/index.astro` (featured) and `src/pages/press/all.astro` (all news).

### Adding a New Press Item

Edit the `newsItems` array in the appropriate file:

```javascript
const newsItems = [
  {
    date: "Jan-26",
    source: "Nature",
    headline: "Headline text here",
    url: "https://example.com/article",
    featured: true
  },
  // ... more items
];
```

### Fields:
- `date`: Month-Year format (e.g., "Jan-26")
- `source`: Publication/outlet name
- `headline`: Article headline
- `url`: Link to the article
- `featured`: Set to `true` for featured news (shows on main press page)

---

## Updating Upcoming Lab Meetings

Edit `src/pages/upcoming.astro` and update the `meetings` array:

```javascript
const meetings = [
  {
    date: 'Mon 01/20',
    location: 'S110 and zoom',
    time: '1:30p-3:30p',
    presenters: ['David', 'Lijia', 'Tony'],
  },
  {
    date: 'Mon 01/27',
    location: 'S110 and zoom',
    time: '1:30p-3:30p',
    presenters: null,
    note: 'NO MEETING',
  },
  // ... more meetings
];
```

### For Cancelled Meetings:
Set `presenters: null` and add `note: 'NO MEETING'`

---

## Updating the Fun Page

Edit `src/pages/fun.astro` to add new photos or events.

### Adding New Photos:
1. Save photos to `public/images/fun/`
2. Add entries to the photos array in `fun.astro`:

```javascript
const photos = [
  {
    src: "/images/fun/lab-retreat-2026.jpg",
    alt: "Lab Retreat 2026",
    caption: "Annual lab retreat at Friday Harbor"
  },
  // ... more photos
];
```

---

## Updating Resources, Support, Contact

### Resources (`src/pages/resources/`)
- **index.astro** - Main resources page
- **centers.astro** - Research centers
- **software.astro** - Lab software/tools

### Support (`src/pages/support.astro`)
Edit the `supporters` array to add/remove funding organizations:

```javascript
const supporters = [
  {
    name: 'Howard Hughes Medical Institute',
    url: 'https://www.hhmi.org/',
    image: '/images/support/hhmi.png',
  },
  // ... more supporters
];
```

### Contact (`src/pages/contact.astro`)
Edit directly to update:
- Email addresses
- Phone numbers
- Physical addresses

---

## Building and Deploying

### Preview Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
This creates a `dist/` folder with static HTML files.

### Deploy
Copy the contents of `dist/` to the web server:
```bash
rsync -avz dist/ user@shendure-web.gs.washington.edu:/path/to/webroot/
```

---

## Troubleshooting

### Common Issues

**"File not found" errors:**
- Check that file paths in JSON match actual file locations
- Paths should start with `/` (e.g., `/images/lab/photo.jpg`)

**Changes not appearing:**
- Make sure you saved the file
- Restart the dev server (`npm run dev`)
- Clear browser cache (Cmd+Shift+R)

**Build errors:**
- Check JSON files for syntax errors (missing commas, quotes)
- Use a JSON validator: https://jsonlint.com/

**Images not displaying:**
- Verify the image exists in `public/images/`
- Check the path in the JSON file matches exactly (case-sensitive)

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

The homepage corner animations rotate randomly through all **Featured Research Articles** only. Reviews, preprints, and pre-2007 papers do not have animations. To force a specific research paper's animation to appear in the upper-left corner for testing:

1. Open `src/components/special/DNAAnimation.astro`
2. Find the line (around line 1658):
   ```javascript
   const initialCategories = shuffledCategories.slice(0, 4);
   ```
   Add below it:
   ```javascript
   // TESTING: Force upper-left corner to show specific category
   initialCategories[0] = 'genome-editing'; // or whichever category
   ```

3. Find the line (around line 1698):
   ```javascript
   const initialShapeIdx = getRandomFromCategory(category);
   ```
   Replace with:
   ```javascript
   let initialShapeIdx = getRandomFromCategory(category);
   // TESTING: Force corner 0 to show specific paper
   if (c === 0) {
     const idx = shapeLinks.findIndex((s) => s.url.includes('paper-slug-here'));
     if (idx >= 0) initialShapeIdx = idx;
   }
   ```

4. Run `npm run dev` and check http://localhost:4321/
5. **Important:** Remove the testing overrides before building for production!

**Available animation categories and their types:**

| Category | Animation Type |
|---|---|
| single-cell-transcriptomics | wellPlate |
| single-cell-chromatin | atacPeaks |
| developmental-atlases | cellClusters |
| genome-editing | rnaHairpin |
| molecular-recording | chevrons |
| variant-analysis | heatmap |
| regulatory-elements | cisRegulatory |
| exome-genome-sequencing | dnaHelix |
| 3d-genome | hiCLoops |
| cell-free-dna | cellFreeDNA |
| disease-genetics | scatterPlot |
| infectious-disease | phyloTree |
| computational-tools | trajectoryTree |

### Getting Help
- Check existing similar files for reference
- Review this guide
- Contact the previous maintainer

---

## Quick Reference

| Task | File(s) to Edit |
|------|----------------|
| Add lab member | `src/content/people/firstname-lastname.json` |
| Move to alumni | Edit existing file in `src/content/people/` |
| Move rotation student to alumni | Delete JSON, add to list in `alumni.astro` + `update-search.cjs` |
| Add publication | `src/content/publications/author-year-title.json` |
| Move preprint to published | See [Moving Preprint to Published](#moving-preprint-to-published) |
| Add to animations | Run `node scripts/auto-categorize-papers.js` |
| Test specific animation | See [Testing a Specific Animation](#testing-a-specific-animation) |
| Update search index | Automatic on `npm run dev` / `npm run build` |
| Update research areas | `src/pages/research.astro` |
| Add press item | `src/pages/press/index.astro` or `all.astro` |
| Update lab meetings | `src/pages/upcoming.astro` |
| Add fun photos | `src/pages/fun.astro` |
| Update support/funding | `src/pages/support.astro` |
| Update contact info | `src/pages/contact.astro` |

---

*Last updated: March 2026*
