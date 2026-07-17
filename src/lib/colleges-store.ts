import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface CollegeRecord {
  mongoId: string;
  id: string;
  active: boolean;
  name: string;
  collegeScore: number | null;
  score: number | null;
  collegeId: string | null;
  universityId: string | null;
  universityTier: string | null;
  universityName: string | null;
  city: string;
  state: string;
  category: string | null;
  aisheId: string | null;
  universityType: string | null;
  abbreviations: string[];
}

interface CollegesCache {
  colleges: CollegeRecord[];
  byId: Map<string, CollegeRecord>;
  byMongoId: Map<string, CollegeRecord>;
  states: string[];
}

let cache: CollegesCache | null = null;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadColleges(): CollegesCache {
  if (cache) return cache;

  const filePath = join(process.cwd(), "data", "colleges.json");
  const colleges = JSON.parse(readFileSync(filePath, "utf-8")) as CollegeRecord[];
  const byId = new Map(colleges.map((college) => [college.id, college]));
  const byMongoId = new Map(colleges.map((college) => [college.mongoId, college]));
  const states = Array.from(
    new Set(colleges.map((college) => college.state).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  cache = { colleges, byId, byMongoId, states };
  return cache;
}

export function getAllColleges(): CollegeRecord[] {
  return loadColleges().colleges;
}

export function getCollegeById(id: string): CollegeRecord | undefined {
  const { byId, byMongoId } = loadColleges();
  return byId.get(id) ?? byMongoId.get(id);
}

function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findCollegeByNameMatch(
  name: string,
  state?: string
): CollegeRecord | undefined {
  const target = normalizeForMatch(name);
  if (!target) return undefined;

  const candidates = getAllColleges().filter(
    (college) => college.active && (!state || college.state === state)
  );

  return candidates.find((college) => {
    const normalized = normalizeForMatch(college.name);
    return normalized.includes(target) || target.includes(normalized);
  });
}

export function getStateNames(): string[] {
  return loadColleges().states;
}

export function resolveStateNameFromSlug(slug: string): string | null {
  const states = getStateNames();
  return states.find((state) => slugify(state) === slug) ?? null;
}

export { slugify };
