/**
 * Migration script to extract publications data from old HTML files
 * Run with: node scripts/migrate-publications.cjs
 */

const fs = require('fs');
const path = require('path');

// Paths
const OLD_SITE = '/Users/osethworklaptop/Desktop/Olga\'s Work Documents (Work Mac Laptop)/NEW SHENDURE LAB WEBSITE';
const OUTPUT_DIR = path.join(__dirname, '../src/content/publications');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to create slug from title
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// Parse a single paper block
function parsePaper(block, category) {
  const paper = { category };

  // Extract article URL
  const urlMatch = block.match(/<a href\s*=\s*"([^"]+)"[^>]*>\s*<img/i);
  if (urlMatch) paper.articleUrl = urlMatch[1];

  // Extract thumbnail image
  const imgMatch = block.match(/src="([^"]+)"/i);
  if (imgMatch) paper.thumbnail = imgMatch[1].replace('images/', '/images/');

  // Extract PDF URL from raw block BEFORE stripping tags
  const pdfMatch = block.match(/href\s*=\s*["']([^"']*\.pdf)["']/i);
  if (pdfMatch) {
    let pdfPath = pdfMatch[1];
    if (pdfPath.startsWith('documents/')) {
      paper.pdfUrl = '/' + pdfPath;
    } else if (pdfPath.startsWith('/')) {
      paper.pdfUrl = pdfPath;
    } else {
      paper.pdfUrl = '/documents/' + pdfPath;
    }
  }

  // Extract the text content after the image
  const textContent = block.replace(/<img[^>]+>/gi, '').replace(/<a[^>]*>|<\/a>/gi, '');

  // Extract citation line (authors, title, journal, year)
  const brSplit = textContent.split(/<br\s*\/?>/i);
  for (const line of brSplit) {
    const cleanLine = line.replace(/<[^>]+>/g, '').trim();

    // Skip empty lines
    if (!cleanLine) continue;

    // Check for PMID
    const pmidMatch = line.match(/PMID:\s*<a[^>]*href="[^"]*\/(\d+)[^"]*"[^>]*>(\d+)/i) ||
                      line.match(/PMID:\s*(\d+)/i);
    if (pmidMatch) {
      paper.pmid = pmidMatch[2] || pmidMatch[1];
      continue;
    }

    // Check for collaboration note
    if (cleanLine.toLowerCase().includes('with ') && cleanLine.includes('Lab')) {
      paper.collaboration = cleanLine.replace(/^\(|\)$/g, '');
      continue;
    }

    // This is likely the citation
    if (cleanLine.length > 20 && !paper.citation) {
      paper.citation = cleanLine;

      // Try to extract year
      const yearMatch = cleanLine.match(/\((\d{4})\)/);
      if (yearMatch) paper.year = parseInt(yearMatch[1]);

      // Try to extract journal
      const journalMatch = cleanLine.match(/\.\s*([A-Z][^(]+)\s*\(\d{4}\)/);
      if (journalMatch) paper.journal = journalMatch[1].trim();
    }
  }

  // Generate slug from citation
  if (paper.citation) {
    const firstAuthor = paper.citation.split(/[,\s]/)[0];
    paper.slug = slugify(`${firstAuthor}-${paper.year || 'unknown'}-${paper.journal || 'paper'}`);
  }

  return paper;
}

// Parse papers from HTML file
function parsePapersHtml(html, category) {
  const papers = [];

  // Split HTML into rows by the &nbsp; separators
  const rows = html.split(/<p>&nbsp;<\/p>\s*<p>&nbsp;<\/p>/i);

  for (const row of rows) {
    // Find all div blocks in this row with their position
    const divRegex = /<div align\s*=\s*"center"\s+id="(left|right|middle)">([\s\S]*?)<\/div>/gi;
    let match;
    const rowPapers = [];

    while ((match = divRegex.exec(row)) !== null) {
      const position = match[1].toLowerCase();
      const content = match[2];
      if (content.includes('<img')) {
        const paper = parsePaper(content, category);
        if (paper.citation) {
          paper._position = position;
          rowPapers.push(paper);
        }
      }
    }

    // Sort papers in this row by visual order: left, middle, right
    const positionOrder = { 'left': 0, 'middle': 1, 'right': 2 };
    rowPapers.sort((a, b) => positionOrder[a._position] - positionOrder[b._position]);

    // Clean up and add to final list
    rowPapers.forEach(p => {
      delete p._position;
      papers.push(p);
    });
  }

  return papers;
}

// Parse preprints from HTML (different format)
function parsePreprintsHtml(html) {
  const papers = [];

  // Match <p class=p1> blocks
  const blocks = html.split(/<p class=p1>/i).slice(1);

  for (const block of blocks) {
    const content = block.split('</p')[0];
    const paper = { category: 'preprint' };

    // Extract authors and title
    // Format: Authors. <a href="URL">Title</a>
    const authorTitleMatch = content.match(/>(.*?)<a\s+href\s*=\s*["']([^"']+)["'][^>]*>\s*([^<]+)/i);
    if (authorTitleMatch) {
      const authors = authorTitleMatch[1].replace(/<[^>]+>/g, '').trim();
      paper.articleUrl = authorTitleMatch[2].trim();
      const title = authorTitleMatch[3].trim();

      // Extract bioRxiv DOI
      const doiMatch = content.match(/<u>bioRxiv<\/u>\s*([\d.]+)/i);
      const doi = doiMatch ? doiMatch[1].trim() : '';

      // Extract date
      const dateMatch = content.match(/Posted\s+(\w+\s+\d+,?\s+\d{4})/i);
      const postedDate = dateMatch ? dateMatch[1].trim() : '';
      const yearMatch = postedDate.match(/(\d{4})/);
      if (yearMatch) paper.year = parseInt(yearMatch[1]);

      // Build citation
      paper.citation = `${authors} ${title} bioRxiv ${doi} (${paper.year || 'unknown'})`;
      paper.journal = 'bioRxiv';
      paper.doi = doi;
      paper.postedDate = postedDate;

      // Generate slug
      const firstAuthor = authors.split(/[,\s]/)[0];
      paper.slug = slugify(`${firstAuthor}-${paper.year || 'unknown'}-${title}`);

      papers.push(paper);
    }
  }

  return papers;
}

// Main
async function main() {
  console.log('Migrating publications data...\n');

  // Clear existing files
  const existingFiles = fs.readdirSync(OUTPUT_DIR);
  for (const f of existingFiles) {
    fs.unlinkSync(path.join(OUTPUT_DIR, f));
  }

  const allPapers = [];

  // Parse research papers
  try {
    const researchHtml = fs.readFileSync(path.join(OLD_SITE, 'research_papers.html'), 'utf-8');
    const researchPapers = parsePapersHtml(researchHtml, 'research');
    console.log(`Found ${researchPapers.length} research papers`);
    allPapers.push(...researchPapers);
  } catch (e) {
    console.error('Error parsing research_papers.html:', e.message);
  }

  // Parse review papers
  try {
    const reviewHtml = fs.readFileSync(path.join(OLD_SITE, 'review_papers.html'), 'utf-8');
    const reviewPapers = parsePapersHtml(reviewHtml, 'review');
    console.log(`Found ${reviewPapers.length} review papers`);
    allPapers.push(...reviewPapers);
  } catch (e) {
    console.error('Error parsing review_papers.html:', e.message);
  }

  // Parse preprint papers (different format)
  try {
    const preprintHtml = fs.readFileSync(path.join(OLD_SITE, 'preprint_papers.html'), 'utf-8');
    const preprintPapers = parsePreprintsHtml(preprintHtml);
    console.log(`Found ${preprintPapers.length} preprint papers`);
    allPapers.push(...preprintPapers);
  } catch (e) {
    console.error('Error parsing preprint_papers.html:', e.message);
  }

  // Add sort order based on position
  allPapers.forEach((paper, index) => {
    paper.sortOrder = index + 1;
  });

  // Write individual JSON files
  const usedSlugs = new Set();
  for (const paper of allPapers) {
    let slug = paper.slug || `paper-${paper.sortOrder}`;
    // Handle duplicate slugs
    let counter = 1;
    let originalSlug = slug;
    while (usedSlugs.has(slug)) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);
    paper.slug = slug;

    const filename = `${slug}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(paper, null, 2));
  }

  // Write combined file for easy review
  const combinedPath = path.join(OUTPUT_DIR, '_all-publications.json');
  fs.writeFileSync(combinedPath, JSON.stringify(allPapers, null, 2));

  console.log(`\nTotal: ${allPapers.length} publications migrated`);

  // Show breakdown by category
  const byCategory = {};
  allPapers.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  });
  console.log('By category:', byCategory);
}

main().catch(console.error);
