export type DegreeLevelId =
  | "diploma"
  | "bachelors"
  | "masters"
  | "phd"
  | "professional";

export type BranchGroup = {
  label: string;
  options: { value: string; label: string }[];
};

export const DEGREE_LEVELS: { value: DegreeLevelId; label: string }[] = [
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
  {
    value: "professional",
    label: "Professional Certification (CA, CS, CMA, etc.)",
  },
];

const FULL_SPECIALIZATION_GROUPS: BranchGroup[] = [
  {
    label: "Engineering",
    options: [
      { value: "eng-cse", label: "CSE" },
      { value: "eng-it", label: "IT" },
      { value: "eng-ece", label: "ECE" },
      { value: "eng-eee", label: "EEE" },
      { value: "eng-mechanical", label: "Mechanical" },
      { value: "eng-civil", label: "Civil" },
      { value: "eng-chemical", label: "Chemical" },
      { value: "eng-aerospace", label: "Aerospace" },
      { value: "eng-biotech", label: "Biotech" },
      { value: "eng-aiml", label: "AI & ML" },
      { value: "eng-ds", label: "Data Science" },
      { value: "eng-other", label: "Other Engineering" },
    ],
  },
  {
    label: "Science",
    options: [
      { value: "sci-physics", label: "Physics" },
      { value: "sci-chemistry", label: "Chemistry" },
      { value: "sci-math", label: "Mathematics" },
      { value: "sci-life", label: "Life Sciences" },
      { value: "sci-stats", label: "Statistics" },
      { value: "sci-other", label: "Other Science" },
    ],
  },
  {
    label: "Commerce",
    options: [
      { value: "com-bcom", label: "B.Com / Accounting / Finance" },
    ],
  },
  {
    label: "Arts",
    options: [
      { value: "arts-english", label: "English" },
      { value: "arts-economics", label: "Economics" },
      { value: "arts-psychology", label: "Psychology" },
      { value: "arts-polisci", label: "Political Science" },
      { value: "arts-sociology", label: "Sociology" },
      { value: "arts-history", label: "History" },
      { value: "arts-journalism", label: "Journalism" },
      { value: "arts-other", label: "Other Arts" },
    ],
  },
  {
    label: "Management",
    options: [
      { value: "mgmt-finance", label: "Finance" },
      { value: "mgmt-marketing", label: "Marketing" },
      { value: "mgmt-hr", label: "HR" },
      { value: "mgmt-ops", label: "Operations" },
      { value: "mgmt-ba", label: "Business Analytics" },
      { value: "mgmt-other", label: "Other Management" },
    ],
  },
  {
    label: "Medicine",
    options: [
      { value: "med-mbbs", label: "Medicine & Surgery (MBBS)" },
      { value: "med-bds", label: "Dental (BDS)" },
      { value: "med-bams", label: "Ayurveda (BAMS)" },
      { value: "med-nursing", label: "Nursing" },
      { value: "med-pharmacy", label: "Pharmacy" },
      { value: "med-other", label: "Other Medicine / Health" },
    ],
  },
  {
    label: "Law",
    options: [{ value: "law-llb", label: "Law (LLB / BA LLB / LLM)" }],
  },
  {
    label: "Architecture & Design",
    options: [
      { value: "arch-architecture", label: "Architecture" },
      { value: "arch-design", label: "Design (Fashion / Interior)" },
    ],
  },
  {
    label: "Education",
    options: [{ value: "edu-bed", label: "Education (B.Ed / M.Ed)" }],
  },
  {
    label: "Other",
    options: [{ value: "other", label: "Other (please specify)" }],
  },
];

const DIPLOMA_GROUPS: BranchGroup[] = [
  {
    label: "Diploma streams",
    options: [
      { value: "dip-cse", label: "Computer Science / IT" },
      { value: "dip-ece", label: "Electronics / ECE" },
      { value: "dip-eee", label: "Electrical / EEE" },
      { value: "dip-mechanical", label: "Mechanical" },
      { value: "dip-civil", label: "Civil" },
      { value: "dip-pharmacy", label: "Pharmacy" },
      { value: "dip-nursing", label: "Nursing" },
      { value: "dip-design", label: "Design / Animation" },
      { value: "dip-business", label: "Business / Management" },
      { value: "other", label: "Other (please specify)" },
    ],
  },
];

const PHD_GROUPS: BranchGroup[] = [
  {
    label: "Research area",
    options: [
      { value: "phd-eng", label: "Engineering / Technology" },
      { value: "phd-science", label: "Science" },
      { value: "phd-commerce", label: "Commerce / Finance" },
      { value: "phd-arts", label: "Arts / Humanities" },
      { value: "phd-mgmt", label: "Management" },
      { value: "phd-medicine", label: "Medicine / Health Sciences" },
      { value: "phd-law", label: "Law" },
      { value: "phd-edu", label: "Education" },
      { value: "other", label: "Other (please specify)" },
    ],
  },
];

const PROFESSIONAL_GROUPS: BranchGroup[] = [
  {
    label: "Certification",
    options: [
      { value: "prof-ca", label: "CA (Chartered Accountant)" },
      { value: "prof-cs", label: "CS (Company Secretary)" },
      { value: "prof-cma", label: "CMA (Cost & Management Accountant)" },
      { value: "prof-cfa", label: "CFA" },
      { value: "prof-acca", label: "ACCA" },
      { value: "other", label: "Other (please specify)" },
    ],
  },
];

export function getBranchGroups(degreeLevel: string): BranchGroup[] {
  switch (degreeLevel) {
    case "bachelors":
    case "masters":
      return FULL_SPECIALIZATION_GROUPS;
    case "diploma":
      return DIPLOMA_GROUPS;
    case "phd":
      return PHD_GROUPS;
    case "professional":
      return PROFESSIONAL_GROUPS;
    default:
      return [];
  }
}

export function getDegreeLevelLabel(value: string): string {
  return DEGREE_LEVELS.find((level) => level.value === value)?.label ?? value;
}

export function getBranchOptions(degreeLevel: string): { value: string; label: string }[] {
  return getBranchGroups(degreeLevel).flatMap((group) => group.options);
}

export function getBranchLabel(degreeLevel: string, branchValue: string): string {
  return (
    getBranchOptions(degreeLevel).find((option) => option.value === branchValue)
      ?.label ?? branchValue
  );
}

export function branchNeedsSpecify(branchValue: string): boolean {
  return branchValue === "other" || branchValue.endsWith("-other");
}
