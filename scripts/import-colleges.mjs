import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const csvPath = join(root, "data", "colleges.csv");
const jsonPath = join(root, "data", "colleges.json");

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function toNullableString(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toNullableNumber(value) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value) {
  return value?.trim().toLowerCase() === "true";
}

const raw = readFileSync(csvPath, "utf-8");
const lines = raw.split(/\r?\n/).filter(Boolean);
const header = parseCsvLine(lines[0]);

const colleges = lines.slice(1).map((line, index) => {
  const row = parseCsvLine(line);
  const record = Object.fromEntries(header.map((key, i) => [key, row[i] ?? ""]));

  const abbreviations = [
    record["abbreviation[0]"],
    record["abbreviation[1]"],
    record["abbreviation[2]"],
    record["abbreviation[3]"],
    record["abbreviation[4]"],
  ]
    .map((value) => value?.trim())
    .filter(Boolean);

  return {
    mongoId: record._id,
    id: record.id,
    active: toBoolean(record.active),
    name: record.name,
    collegeScore: toNullableNumber(record.college_score),
    score: toNullableNumber(record.score),
    collegeId: toNullableString(record.college_id),
    universityId: toNullableString(record.university_id),
    universityTier: toNullableString(record.university_tier),
    universityName: toNullableString(record.university_name),
    city: toNullableString(record.city) ?? "",
    state: toNullableString(record.state) ?? "",
    category: toNullableString(record.category),
    aisheId: toNullableString(record.aishe_id),
    universityType: toNullableString(record.university_type),
    abbreviations,
  };
});

if (colleges.length === 0) {
  throw new Error("No colleges found in CSV");
}

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, JSON.stringify(colleges));

console.log(`Imported ${colleges.length.toLocaleString()} colleges to data/colleges.json`);
