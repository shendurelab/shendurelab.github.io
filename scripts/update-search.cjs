const fs = require("fs");

// ========== People ==========
const peopleDir = "src/content/people";
const peopleFiles = fs.readdirSync(peopleDir).filter(f => f.endsWith(".json") && !f.startsWith("_"));
const peopleData = peopleFiles.map(f => {
  const p = JSON.parse(fs.readFileSync(peopleDir + "/" + f, "utf8"));
  return { name: p.name, slug: p.slug, title: p.title, status: p.status };
});

// Other Alumni (no individual JSON files — listed on alumni page)
const otherAlumni = [
  { name: "Kaimana Moraes", title: "Undergraduate (Columbia University), Summer 2023" },
  { name: "Melissa Phung", title: "Undergraduate (CWRU), Summer 2021–2022" },
  { name: "Amira Ellison", title: "Undergraduate (Penn State University), Summer 2021" },
  { name: "Kaitlin Beel", title: "Undergraduate (UW), 2020" },
  { name: "Taylor Real", title: "Undergraduate (UC Santa Cruz), Summer 2019" },
  { name: "Tanvi Reddy", title: "Volunteer (Roosevelt High School), Summer 2018" },
  { name: "Rajiv McCoy", title: "Visiting Postdoctoral Fellow, 2017–2018" },
  { name: "Nikhil Patkar", title: "Visiting Scientist, 2016–2017" },
  { name: "Elizabeth Aguilar", title: "Undergraduate (DePauw), Summer 2017" },
  { name: "Joseph Sayad", title: "Undergraduate (Hunter), Summer 2017" },
  { name: "Meara Davies", title: "Graduate Researcher, 2012–2013" },
  { name: "Chris Lambert", title: "Undergraduate (UW), 2011" },
  { name: "Monica Mascarenas", title: "Undergraduate (UNM), Summer 2010" },
  { name: "Amy Olson", title: "Undergraduate (UW), 2008–2009" },
  { name: "Steven Cazales", title: "Undergraduate (UW), GenOM Project, Summer 2008" },
  { name: "Steven Flygare", title: "Undergraduate (BYU), Amgen Scholars, Summer 2008" },
];

// Past Rotation Students (no individual JSON files — listed on alumni page)
const rotationStudents = [
  { name: "Monica (Moni) Padilla Galvez", title: "Rotation Student (GS), Winter 2026" },
  { name: "PeiXi Chen", title: "Rotation Student (MCB), Winter 2025" },
  { name: "Kristian Choate", title: "Rotation Student (MCB), Fall 2024" },
  { name: "Yufei (Nancy) Gao", title: "Rotation Student (BioE), Winter 2024" },
  { name: "Lucas Kerr", title: "Rotation Student (GS), Summer 2023" },
  { name: "Elliott Swanson", title: "Rotation Student (GS), Spring 2022" },
  { name: "Sydney Sattler", title: "Rotation Student (GS), Winter 2022" },
  { name: "Yuzhen Liu", title: "Rotation Student (GS), Spring 2020" },
  { name: "Conor Camplisson", title: "Rotation Student (GS), Winter 2020" },
  { name: "Andrew Mullen", title: "Rotation Student (MSTP), Summer 2019" },
  { name: "Shawn Fayer", title: "Rotation Student (GS), Spring 2019" },
  { name: "James Anderson", title: "Rotation Student (MCB), Winter 2019" },
  { name: "Eliza Barkan", title: "Rotation Student (MCB), Fall 2018" },
  { name: "Michael Goldberg", title: "Rotation Student (GS), Spring 2018" },
  { name: "Philip Dishuk", title: "Rotation Student (GS), Winter 2017" },
  { name: "William DeWitt", title: "Rotation Student (GS), Fall 2017" },
  { name: "Bingjie Wang", title: "Rotation Student (MSTP), Summer 2017" },
  { name: "Joseph Janizek", title: "Rotation Student (MSTP), Summer 2017" },
  { name: "April Lo", title: "Rotation Student (GS), Spring 2017" },
  { name: "Ian Smith", title: "Rotation Student (GS), Spring 2017" },
  { name: "Eliah Overbey", title: "Rotation Student (GS), Spring 2016" },
  { name: "Aakash Sur", title: "Rotation Student (BMI), Fall 2015" },
  { name: "Serena Liu", title: "Rotation Student (GS), Spring 2015" },
  { name: "Damon May", title: "Rotation Student (GS), Winter 2015" },
  { name: "Hugh Haddox", title: "Rotation Student (MCB), Spring 2013" },
  { name: "Elyse Hope", title: "Rotation Student (GS), Winter 2012" },
  { name: "Jorgen Nelson", title: "Rotation Student (GS), Winter 2012" },
  { name: "Jenny Wagner", title: "Rotation Student (GS), Winter 2011" },
  { name: "Josh Burton", title: "Rotation Student (GS), Winter 2011" },
  { name: "Meara Davies", title: "Rotation Student (MCB), Fall 2011" },
  { name: "David Young", title: "Rotation Student (MSTP), Summer 2009" },
  { name: "Keisha Carlson", title: "Rotation Student (GS), Winter 2009" },
  { name: "Jarrett Egerston", title: "Rotation Student (GS), Winter 2009" },
  { name: "Matthew Maurano", title: "Rotation Student (GS), Fall 2008" },
  { name: "Sayer Herrin", title: "Rotation Student (GS), Winter 2008" },
];

// Slugify helper (must match the logic in alumni.astro)
function slugify(name) {
  return name.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Combine all — other alumni and rotation students link to the alumni page with highlight
const allSearchPeople = [
  ...peopleData,
  ...otherAlumni.map(p => ({ name: p.name, slug: slugify(p.name), title: p.title, status: "alumni" })),
  ...rotationStudents.map(p => ({ name: p.name, slug: slugify(p.name), title: p.title, status: "alumni" })),
];

fs.writeFileSync("public/data/people-search.json", JSON.stringify(allSearchPeople, null, 2));
console.log("Updated people-search.json with", allSearchPeople.length, "entries (" + peopleData.length + " from JSON + " + otherAlumni.length + " other alumni + " + rotationStudents.length + " rotation students)");

// ========== Publications ==========
const pubsDir = "src/content/publications";
const files = fs.readdirSync(pubsDir).filter(f => f.endsWith(".json") && !f.startsWith("_"));
const pubs = files.map(f => JSON.parse(fs.readFileSync(pubsDir + "/" + f, "utf8")));

const searchData = pubs.map(p => {
  const citation = p.citation || "";
  const parts = citation.split(". ");
  const authors = parts[0] || "";
  const title = parts.slice(1, -1).join(". ") || "";
  const journalPart = (parts[parts.length - 1] || "").replace(/\(\d{4}\)$/, "").trim();

  return {
    title: title || (p.journal ? p.journal.split(".")[0] : ""),
    authors: authors,
    journal: journalPart || (p.journal ? p.journal.split(".").pop().trim() : ""),
    year: p.year,
    category: p.category,
    slug: p.slug || ""
  };
});

fs.writeFileSync("public/data/publications-search.json", JSON.stringify(searchData, null, 2));
console.log("Updated publications-search.json with", searchData.length, "entries");

// ========== News/Press ==========
const pressContent = fs.readFileSync("src/pages/press/all.astro", "utf8");

// Extract news items using regex
const newsRegex = /\{\s*date:\s*'([^']+)',\s*source:\s*'([^']+)',\s*headline:\s*'([^']+)',\s*url:\s*'([^']+)'\s*\}/g;
const newsItems = [];
let match;

while ((match = newsRegex.exec(pressContent)) !== null) {
  const [, date, source, headline, url] = match;
  // Parse year from date (format: "Mon-YY")
  const yearPart = date.split('-')[1];
  const year = yearPart ? parseInt('20' + yearPart) : null;

  newsItems.push({
    date: date,
    source: source,
    headline: headline,
    url: url,
    year: year
  });
}

fs.writeFileSync("public/data/news-search.json", JSON.stringify(newsItems, null, 2));
console.log("Updated news-search.json with", newsItems.length, "entries");
