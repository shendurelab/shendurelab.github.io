/**
 * Migration script to extract people data from old HTML files
 * Run with: node scripts/migrate-people.cjs
 */

const fs = require('fs');
const path = require('path');

// Paths
const OLD_SITE = '/Users/osethworklaptop/Desktop/Olga\'s Work Documents (Work Mac Laptop)/NEW SHENDURE LAB WEBSITE';
const OUTPUT_DIR = path.join(__dirname, '../src/content/people');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to create slug from name
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper to extract email from text
function extractEmail(text) {
  const match = text.match(/mailto:([^">\s]+)/i);
  if (match) return match[1].trim().replace(/\s+/g, '');
  return null;
}

// Helper to clean HTML and get text
function cleanHtml(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Determine role from title
function getRoleFromTitle(title) {
  const t = title.toLowerCase();
  if (t.includes('principal investigator')) return 'pi';
  if (t.includes('research assistant professor') || t.includes('assistant professor')) return 'faculty';
  if (t.includes('postdoctoral') || t.includes('postdoc')) return 'postdoc';
  if (t.includes('graduate student') || t.includes('md-phd')) return 'graduate-student';
  if (t.includes('research scientist')) return 'research-scientist';
  if (t.includes('undergraduate')) return 'undergraduate';
  if (t.includes('lab manager') || t.includes('lab administrator') || t.includes('admin')) return 'staff';
  if (t.includes('visiting')) return 'visiting';
  if (t.includes('volunteer')) return 'volunteer';
  if (t.includes('rotation')) return 'rotation';
  return 'other';
}

// Parse current members
function parseCurrentMembers(html) {
  const people = [];

  // Split by div id patterns to get each person block
  const blocks = html.split(/<div id="(?:left|right|middle)">/i).slice(1);

  for (const block of blocks) {
    // Get content up to closing div
    const content = block.split('</div>')[0];

    // Extract image
    const imgMatch = content.match(/src="([^"]+)"/i);
    const imagePath = imgMatch ? imgMatch[1] : '';

    // Extract name - it's in <strong> tags
    const nameMatch = content.match(/<strong>([^<]+)<\/strong>/i);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    // Skip section headers
    if (name.toLowerCase().includes('rotation')) continue;

    // Extract everything after the name for parsing
    const afterName = content.substring(content.indexOf('</strong>') + 9);

    // Split by <br> to get lines
    const lines = afterName.split(/<br\s*\/?>/i).map(l => cleanHtml(l)).filter(Boolean);

    // First non-empty line is usually the title
    let title = '';
    let jointLab = null;
    let email = null;

    for (const line of lines) {
      if (line.toLowerCase().startsWith('email:') || line.includes('@')) {
        // This is email line
        const emailMatch = afterName.match(/mailto:([^">\s]+)/i);
        if (emailMatch) email = emailMatch[1].trim().replace(/\s+/g, '');
      } else if (line.toLowerCase().includes('joint w/') || line.toLowerCase().includes('(joint')) {
        // Extract joint lab
        const jointMatch = afterName.match(/joint w\/[^<]*<a[^>]*>(?:<strong>)?([^<]+)/i);
        if (jointMatch) jointLab = jointMatch[1].trim();
        // The title might be in this line too
        if (!title) {
          title = line.replace(/\(joint.*$/i, '').trim();
        }
      } else if (line.toLowerCase().startsWith('admin:')) {
        // Skip admin line
      } else if (!title && line.length > 0) {
        // This is likely the title
        title = line;
      }
    }

    // Clean up title
    title = title.replace(/\(joint.*$/i, '').trim();

    // Special handling for Jay Shendure
    const isPI = name.includes('Jay Shendure');
    if (isPI) {
      title = 'Principal Investigator';
    }

    const role = isPI ? 'pi' : getRoleFromTitle(title);

    const person = {
      name: name,
      slug: slugify(name),
      photo: imagePath.replace('images/', '/images/'),
      title: title,
      role: role,
      email: email,
      status: 'current',
    };

    if (jointLab) person.jointLab = jointLab;

    people.push(person);
  }

  return people;
}

// Parse alumni
function parseAlumni(html) {
  const people = [];

  const blocks = html.split(/<div id="(?:left|right|middle)">/i).slice(1);

  for (const block of blocks) {
    const content = block.split('</div>')[0];

    // Extract image
    const imgMatch = content.match(/src="([^"]+)"/i);
    const imagePath = imgMatch ? imgMatch[1] : '';

    // Extract name
    const nameMatch = content.match(/<strong>([^<]+)<\/strong>/i);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    // Extract everything after the name
    const afterName = content.substring(content.indexOf('</strong>') + 9);
    const lines = afterName.split(/<br\s*\/?>/i).map(l => cleanHtml(l)).filter(Boolean);

    let title = '';
    let startYear = null;
    let endYear = null;
    let dissertation = null;
    let currentPosition = null;
    let jointLab = null;

    for (const line of lines) {
      // Check for years pattern
      const yearsMatch = line.match(/(\d{4})\s*-\s*(\d{4})/);
      if (yearsMatch) {
        startYear = parseInt(yearsMatch[1]);
        endYear = parseInt(yearsMatch[2]);
        continue;
      }

      // Check for dissertation
      if (line.toLowerCase().includes('dissertation:')) {
        const dissMatch = afterName.match(/Dissertation:\s*(?:&quot;|")([^"&]+)(?:&quot;|")/i);
        if (dissMatch) dissertation = dissMatch[1];
        continue;
      }

      // Check for current position
      if (line.toLowerCase().startsWith('current:')) {
        currentPosition = line.replace(/^current:\s*/i, '').trim();
        continue;
      }

      // Check for joint lab
      if (line.toLowerCase().includes('joint w/') || line.toLowerCase().includes('(joint')) {
        const jointMatch = afterName.match(/joint w\/[^<]*<a[^>]*>(?:<strong>)?([^<]+)/i);
        if (jointMatch) jointLab = jointMatch[1].trim();
      }

      // First line is usually the title
      if (!title && line.length > 0 && !line.match(/^\d{4}/) && !line.toLowerCase().includes('current:')) {
        title = line.replace(/\(joint.*$/i, '').trim();
      }
    }

    // Extract current position from link if not found
    if (!currentPosition) {
      const currentMatch = afterName.match(/Current:\s*<a[^>]*>([^<]+)/i);
      if (currentMatch) currentPosition = currentMatch[1].trim();
    }

    const role = getRoleFromTitle(title);

    const person = {
      name: name,
      slug: slugify(name),
      photo: imagePath.replace('images/', '/images/'),
      title: title,
      role: role,
      status: 'alumni',
      startYear,
      endYear,
    };

    if (jointLab) person.jointLab = jointLab;
    if (dissertation) person.dissertation = dissertation;
    if (currentPosition) person.currentPosition = currentPosition;

    people.push(person);
  }

  return people;
}

// Main
async function main() {
  console.log('Migrating people data...\n');

  // Clear existing files
  const existingFiles = fs.readdirSync(OUTPUT_DIR);
  for (const f of existingFiles) {
    fs.unlinkSync(path.join(OUTPUT_DIR, f));
  }

  // Read HTML files
  const currentHtml = fs.readFileSync(path.join(OLD_SITE, 'current.html'), 'utf-8');
  const alumniHtml = fs.readFileSync(path.join(OLD_SITE, 'alumni.html'), 'utf-8');

  // Parse
  const currentMembers = parseCurrentMembers(currentHtml);
  const alumni = parseAlumni(alumniHtml);

  console.log(`Found ${currentMembers.length} current members`);
  console.log(`Found ${alumni.length} alumni\n`);

  // Log role distribution for current members
  const roleCount = {};
  currentMembers.forEach(p => {
    roleCount[p.role] = (roleCount[p.role] || 0) + 1;
  });
  console.log('Current members by role:', roleCount);

  // Combine all people
  const allPeople = [...currentMembers, ...alumni];

  // Write individual JSON files
  for (const person of allPeople) {
    const filename = `${person.slug}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(person, null, 2));
  }

  // Also write a combined file for easy review
  const combinedPath = path.join(OUTPUT_DIR, '_all-people.json');
  fs.writeFileSync(combinedPath, JSON.stringify(allPeople, null, 2));

  console.log(`\nTotal: ${allPeople.length} people migrated`);
}

main().catch(console.error);
