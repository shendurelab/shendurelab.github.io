#!/usr/bin/env node
/**
 * Auto-categorize papers script
 *
 * This script automatically categorizes new papers into one of 13 research categories
 * based on keywords in their titles/citations, and adds them to animations.json.
 *
 * Usage: node scripts/auto-categorize-papers.js
 *
 * The script will:
 * 1. Read all publications from src/content/publications/
 * 2. Check which ones are not yet in animations.json
 * 3. Categorize them based on keywords
 * 4. Add them to animations.json with appropriate animation type and variation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PUBLICATIONS_DIR = path.join(__dirname, '../src/content/publications');
const ANIMATIONS_FILE = path.join(__dirname, '../src/content/animations.json');

// Category to animation type mapping
const CATEGORY_TO_TYPE = {
  'single-cell-transcriptomics': 'wellPlate',
  'single-cell-chromatin': 'atacPeaks',
  'developmental-atlases': 'cellClusters',
  'genome-editing': 'rnaHairpin',
  'molecular-recording': 'chevrons',
  'variant-analysis': 'heatmap',
  'regulatory-elements': 'cisRegulatory',
  'exome-genome-sequencing': 'dnaHelix',
  '3d-genome': 'hiCLoops',
  'cell-free-dna': 'cellFreeDNA',
  'disease-genetics': 'scatterPlot',
  'infectious-disease': 'phyloTree',
  'computational-tools': 'trajectoryTree'
};

// Keywords for each category (order matters - more specific categories first)
const CATEGORY_KEYWORDS = {
  'molecular-recording': [
    'lineage tracing', 'lineage-tracing', 'molecular recording', 'molecular recorder',
    'dna typewriter', 'gestalt', 'cell lineage', 'barcode', 'barcoding',
    'recording of signalling', 'symbolic recording', 'time-resolved', 'multi-symbol',
    'genomic recording', 'engram'
  ],
  'single-cell-chromatin': [
    'single-cell chromatin', 'single cell chromatin', 'sci-atac', 'sciatac',
    'atac-seq', 'chromatin accessibility', 'single-cell atac', 'single cell atac',
    'chromatin profiling', 'nucleosome', 'dnase', 'chromatin atlas'
  ],
  'single-cell-transcriptomics': [
    'single-cell transcriptom', 'single cell transcriptom', 'sci-rna', 'scirna',
    'single-cell rna', 'single cell rna', 'scrna-seq', 'scrna seq',
    'single-nucleus', 'single nucleus', 'cell atlas', 'gene expression atlas',
    'sci-fate', 'spatial transcriptom', 'single-cell sequencing'
  ],
  'developmental-atlases': [
    'developmental atlas', 'embryo atlas', 'fetal atlas', 'organogenesis',
    'embryonic development', 'gastrulation', 'gastruloid', 'embryoid',
    'developmental trajectory', 'prenatal development', 'cell fate',
    'drosophila embry', 'mouse embry', 'human embry', 'mammalian development'
  ],
  'genome-editing': [
    'crispr', 'cas9', 'cas12', 'cas13', 'genome editing', 'gene editing',
    'prime editing', 'base editing', 'saturation editing', 'flashfry',
    'guide rna', 'grna', 'sgrna', 'genomic deletion', 'paired prime'
  ],
  '3d-genome': [
    '3d genome', 'three-dimensional genome', 'hi-c', 'hic', 'chromatin loop',
    'chromatin contact', 'tad', 'topologically associated', 'nuclear organization',
    'chromosome conformation', 'cicero', 'cis-regulatory dna interaction',
    'genome architecture', '3d organization'
  ],
  'variant-analysis': [
    'variant effect', 'variant interpretation', 'variant classification',
    'missense variant', 'variant function', 'saturation mutagenesis',
    'deep mutational scanning', 'dms', 'multiplex assay of variant effect',
    'mave', 'brca1 variant', 'brca2 variant', 'vus', 'variant of uncertain',
    'protein variant', 'amino acid substitution'
  ],
  'regulatory-elements': [
    'enhancer', 'promoter', 'cis-regulatory', 'cis regulatory', 'mpra',
    'massively parallel reporter', 'regulatory element', 'gene regulation',
    'transcription factor binding', 'regulatory genome', 'non-coding',
    'regulatory variant', 'crispri screen', 'crispra screen'
  ],
  'cell-free-dna': [
    'cell-free dna', 'cell free dna', 'cfdna', 'cf-dna', 'circulating dna',
    'liquid biopsy', 'noninvasive prenatal', 'nipt', 'fetal dna',
    'circulating tumor', 'ctdna', 'prenatal sequencing', 'prenatal diagnosis'
  ],
  'infectious-disease': [
    'covid', 'sars-cov', 'coronavirus', 'viral', 'virus', 'pathogen',
    'infection', 'infectious', 'flu study', 'influenza', 'outbreak',
    'epidemic', 'pandemic', 'phylogenetic', 'transmission', 'bacterial'
  ],
  'disease-genetics': [
    'mendelian', 'rare disease', 'genetic disease', 'autism', 'asd',
    'intellectual disability', 'congenital', 'syndrome', 'mutation',
    'de novo', 'cadd', 'deleteriousness', 'pathogenic', 'clinical sequencing',
    'kabuki', 'miller syndrome', 'disease gene', 'genetic diagnosis',
    'idiopathic pulmonary', 'proteomic landscape'
  ],
  'exome-genome-sequencing': [
    'exome sequencing', 'genome sequencing', 'whole genome', 'whole exome',
    'next-generation sequencing', 'ngs', 'targeted sequencing', 'capture sequencing',
    'haplotype', 'de novo assembly', 'scaffolding', 'metagenome', 'polony',
    'tagmentation', 'molecular inversion probe', 'mip', 'exon capture',
    'dna sequencing at 40', 'long-range sequencing'
  ],
  'computational-tools': [
    'computational', 'algorithm', 'software', 'pipeline', 'bioinformatics',
    'machine learning', 'deep learning', 'prediction', 'classifier',
    'database', 'web tool', 'method', 'protocol', 'framework', 'review',
    'perspective', 'commentary', 'opinion', 'future of', 'progress'
  ]
};

/**
 * Categorize a paper based on its citation/title
 */
function categorizePaper(citation) {
  const text = citation.toLowerCase();

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  // Default to computational-tools if no match found
  return 'computational-tools';
}

/**
 * Generate a display name for the animation
 */
function generateAnimationName(publication) {
  // Extract first author's last name from citation
  const citation = publication.citation || '';
  const match = citation.match(/^([A-Za-z'-]+)/);
  const firstAuthor = match ? match[1] : 'Unknown';

  // Get year
  const year = publication.year || 'Unknown';

  // Get category display name
  const category = categorizePaper(citation);
  const categoryDisplay = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${firstAuthor}, ${year}, ${categoryDisplay}`;
}

/**
 * Simple hash function for consistent variation assignment
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Main function
 */
function main() {
  console.log('Auto-categorizing papers...\n');

  // Read existing animations
  const animationsData = JSON.parse(fs.readFileSync(ANIMATIONS_FILE, 'utf8'));
  const existingSlugs = new Set(animationsData.animations.map(a => a.paperSlug));

  // Get max sortOrder
  let maxSortOrder = Math.max(...animationsData.animations.map(a => a.sortOrder || 0));

  // Read all publications
  const pubFiles = fs.readdirSync(PUBLICATIONS_DIR)
    .filter(f => f.endsWith('.json'));

  const newAnimations = [];

  for (const file of pubFiles) {
    const pubPath = path.join(PUBLICATIONS_DIR, file);
    const publication = JSON.parse(fs.readFileSync(pubPath, 'utf8'));

    // Skip if no slug
    if (!publication.slug) {
      console.log(`Skipping ${file}: no slug property`);
      continue;
    }

    // Skip if already in animations
    if (existingSlugs.has(publication.slug)) {
      continue;
    }

    // Only include Featured Research Articles in animations
    // Skip reviews, preprints, and pre-2007 papers
    if (publication.category !== 'research') {
      console.log(`Skipping ${file}: not a research article (category: ${publication.category})`);
      continue;
    }

    // Categorize the paper
    const category = categorizePaper(publication.citation || '');
    const animationType = CATEGORY_TO_TYPE[category];

    // Generate variation (0-5, based on hash of slug for consistency)
    const variation = Math.abs(hashCode(publication.slug)) % 6;

    // Create animation entry
    const animation = {
      name: generateAnimationName(publication),
      category: category,
      type: animationType,
      paperSlug: publication.slug,
      variation: variation,
      sortOrder: ++maxSortOrder
    };

    newAnimations.push(animation);
    console.log(`+ Added: ${animation.name}`);
    console.log(`  Category: ${category} -> ${animationType}`);
    console.log(`  Slug: ${publication.slug}\n`);
  }

  if (newAnimations.length === 0) {
    console.log('No new papers to add. All publications are already in animations.json');
    return;
  }

  // Add new animations to the data
  animationsData.animations.push(...newAnimations);

  // Sort by sortOrder
  animationsData.animations.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Write back to file
  fs.writeFileSync(ANIMATIONS_FILE, JSON.stringify(animationsData, null, 2) + '\n');

  console.log(`\nDone! Added ${newAnimations.length} new paper(s) to animations.json`);
  console.log(`Total animations: ${animationsData.animations.length}`);
}

// Run the script
main();
