"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/universities/StarRating";
import { ReviewVerifyFlow } from "@/components/universities/ReviewVerifyFlow";
import {
  DEGREE_LEVELS,
  branchNeedsSpecify,
  getBranchOptions,
  getDegreeLevelLabel,
} from "@/lib/review-degree-options";

import "@/styles/university-detail.css";

type TileOption = { value: string; label: string };
type SelectOption = { value: string; label: string };

type FieldDef = {
  id: string;
  type: "number" | "text";
  label: string;
  placeholder?: string;
  step?: string;
  suffix?: string;
};

type DetailQuestion =
  | { id: string; type: "rating"; label: string }
  | {
      id: string;
      type: "tiles";
      label: string;
      required?: boolean;
      columns?: 2 | 3;
      options: TileOption[];
    }
  | {
      id: string;
      type: "select";
      label: string;
      placeholder?: string;
      options: SelectOption[];
    }
  | { id: string; type: "row"; fields: FieldDef[] }
  | {
      id: string;
      type: "conditional-row";
      when: { questionId: string; equals: string };
      fields: FieldDef[];
    }
  | {
      id: string;
      type: "conditional-text";
      when: { questionId: string; equals: string };
      label: string;
      placeholder?: string;
      rows?: number;
    };

type Criterion = {
  id: string;
  label: string;
  detailQuestions?: DetailQuestion[];
};

/**
 * Advanced review v2 — categories expand inline.
 * Add fields to `detailQuestions` (rating | tiles | select | row | conditional-*).
 */
const CRITERIA: Criterion[] = [
  {
    id: "academics",
    label: "Academics",
    detailQuestions: [
      { id: "teaching", type: "rating", label: "Teaching quality" },
      {
        id: "curriculum",
        type: "rating",
        label: "Curriculum quality & relevance",
      },
      {
        id: "examFairness",
        type: "rating",
        label: "Exam & evaluation fairness",
      },
      {
        id: "industryExposure",
        type: "rating",
        label: "Industry-relevant projects/exposure",
      },
    ],
  },
  {
    id: "faculty",
    label: "Faculty",
    detailQuestions: [
      {
        id: "expertise",
        type: "rating",
        label: "Faculty subject expertise",
      },
      {
        id: "mentorship",
        type: "rating",
        label: "Approachability & mentorship",
      },
      {
        id: "classSize",
        type: "select",
        label: "Faculty-student ratio (felt)",
        placeholder: "Select class size",
        options: [
          { value: "small", label: "Small classes" },
          { value: "medium", label: "Medium classes" },
          { value: "large", label: "Large classes" },
        ],
      },
    ],
  },
  {
    id: "placements",
    label: "Placements",
    detailQuestions: [
      { id: "onCampus", type: "rating", label: "On-campus placement support" },
      {
        id: "training",
        type: "rating",
        label: "Training & prep (aptitude, mock interviews)",
      },
      { id: "internships", type: "rating", label: "Internship opportunities" },
      {
        id: "higherStudies",
        type: "rating",
        label: "Higher studies support (GATE/GRE/research)",
      },
      {
        id: "wasPlaced",
        type: "tiles",
        label: "Were you placed?",
        required: true,
        columns: 3,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "na", label: "Still studying" },
        ],
      },
      {
        id: "batchStats",
        type: "row",
        fields: [
          {
            id: "batchPlacedCount",
            type: "number",
            label: "Batch placed",
            placeholder: "e.g. 85",
          },
          {
            id: "batchSize",
            type: "number",
            label: "Batch size",
            placeholder: "e.g. 120",
          },
        ],
      },
      {
        id: "packageStats",
        type: "row",
        fields: [
          {
            id: "avgPackageCtc",
            type: "number",
            label: "Average package (CTC)",
            placeholder: "e.g. 8.5",
            step: "0.1",
            suffix: "LPA",
          },
          {
            id: "highestPackageCtc",
            type: "number",
            label: "Highest package (CTC)",
            placeholder: "e.g. 42",
            step: "0.1",
            suffix: "LPA",
          },
        ],
      },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    detailQuestions: [
      { id: "labs", type: "rating", label: "Labs & classrooms" },
      { id: "hostel", type: "rating", label: "Hostel & campus buildings" },
      { id: "library", type: "rating", label: "Library & study spaces" },
      { id: "wifi", type: "rating", label: "Wifi & internet connectivity" },
      { id: "mess", type: "rating", label: "Mess/food quality" },
      {
        id: "sports",
        type: "rating",
        label: "Sports & recreational facilities",
      },
    ],
  },
  {
    id: "campusCulture",
    label: "Campus Culture",
    detailQuestions: [
      {
        id: "clubs",
        type: "rating",
        label: "Clubs, fests & extracurriculars",
      },
      { id: "diversity", type: "rating", label: "Diversity & inclusiveness" },
      {
        id: "peerCommunity",
        type: "rating",
        label: "Peer community / student relationships",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety & Security",
    detailQuestions: [
      {
        id: "campusSafety",
        type: "rating",
        label: "General campus safety & security",
      },
      {
        id: "ragging",
        type: "tiles",
        label: "Ragging/hazing — did you experience or witness it?",
        columns: 3,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "preferNot", label: "Prefer not to say" },
        ],
      },
      {
        id: "raggingDescription",
        type: "conditional-text",
        when: { questionId: "ragging", equals: "yes" },
        label: "Brief description (optional)",
        placeholder: "Share only what you are comfortable sharing.",
        rows: 3,
      },
    ],
  },
  {
    id: "studentSupport",
    label: "Student Support",
    detailQuestions: [
      {
        id: "mentalHealth",
        type: "rating",
        label: "Mental health / counseling support",
      },
      {
        id: "adminResponsiveness",
        type: "rating",
        label: "Admin/management responsiveness",
      },
      {
        id: "grievance",
        type: "rating",
        label: "Grievance redressal process",
      },
    ],
  },
  {
    id: "valueForMoney",
    label: "Value for Money",
    detailQuestions: [
      { id: "feesVsQuality", type: "rating", label: "Fees vs. quality received" },
      {
        id: "scholarships",
        type: "tiles",
        label: "Scholarships / financial aid availability",
        columns: 3,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "unsure", label: "Not sure" },
        ],
      },
    ],
  },
];

type CriteriaId = (typeof CRITERIA)[number]["id"];
type ReviewMode = "quick" | "advanced";

interface CollegeReviewFormProps {
  institutionName: string;
}

function emptyRatings(ids: string[]) {
  return Object.fromEntries(ids.map((id) => [id, 0])) as Record<string, number>;
}

function collectRatingIds(criteria: Criterion[]): string[] {
  const ids: string[] = [];
  for (const criterion of criteria) {
    for (const q of criterion.detailQuestions ?? []) {
      if (q.type === "rating") ids.push(`${criterion.id}.${q.id}`);
    }
  }
  return ids;
}

function ratingDetailKeys(criterion: Criterion): string[] {
  return (criterion.detailQuestions ?? [])
    .filter((q): q is Extract<DetailQuestion, { type: "rating" }> => q.type === "rating")
    .map((q) => `${criterion.id}.${q.id}`);
}

/** Average of sub-ratings, rounded to 1 decimal (tenths of a star). */
function averageDetailRatings(
  criterion: Criterion,
  detailRatings: Record<string, number>
): number | null {
  const keys = ratingDetailKeys(criterion);
  if (keys.length === 0) return null;
  if (!keys.every((key) => (detailRatings[key] ?? 0) > 0)) return null;
  const sum = keys.reduce((acc, key) => acc + (detailRatings[key] ?? 0), 0);
  return Math.round((sum / keys.length) * 10) / 10;
}

function expandInitialAdvanced() {
  return { academics: true };
}

function TileRadioGroup({
  name,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  options: TileOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div
      className="review-tiles"
      data-columns={columns}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`review-tile${value === option.value ? " review-tile--active" : ""}`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function CriteriaRow({
  label,
  value,
  onChange,
  required,
  nested,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  nested?: boolean;
}) {
  return (
    <div
      className={`review-criteria__row${nested ? " review-criteria__row--nested" : ""}`}
    >
      <span className="review-criteria__label">
        {label}
        {required && <span className="review-criteria__required">*</span>}
      </span>
      <StarRating value={value} onChange={onChange} compact />
    </div>
  );
}

function DetailFieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  return (
    <div className="college-review-form__field">
      <Label htmlFor={inputId} className="college-review-form__question">
        {field.label}
        {field.suffix ? (
          <span className="college-review-form__field-suffix">
            {" "}
            ({field.suffix})
          </span>
        ) : null}
      </Label>
      <Input
        id={inputId}
        type={field.type === "number" ? "number" : "text"}
        min={field.type === "number" ? 0 : undefined}
        step={field.step}
        className="college-review-form__input"
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function CollegeReviewForm({ institutionName }: CollegeReviewFormProps) {
  const [mode, setMode] = useState<ReviewMode>("quick");
  const [overallRating, setOverallRating] = useState(0);
  const [criteriaRatings, setCriteriaRatings] = useState(() =>
    emptyRatings(CRITERIA.map((c) => c.id))
  );
  const [detailRatings, setDetailRatings] = useState(() =>
    emptyRatings(collectRatingIds(CRITERIA))
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Partial<Record<CriteriaId, boolean>>>(
    {}
  );
  /** Parent stars the user set by hand — skip auto-average for these. */
  const [manualCriteria, setManualCriteria] = useState<
    Partial<Record<CriteriaId, boolean>>
  >({});

  const [currentlyStudying, setCurrentlyStudying] = useState("");
  const [reviewerRelation, setReviewerRelation] = useState("");
  const [reviewerRelationOther, setReviewerRelationOther] = useState("");
  const [comment, setComment] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");
  const [branch, setBranch] = useState("");
  const [branchOther, setBranchOther] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [showVerifyFlow, setShowVerifyFlow] = useState(false);
  const [verifySession, setVerifySession] = useState(0);

  const branchOptions = getBranchOptions(degreeLevel);
  const selectedBranch =
    branchOptions.find((option) => option.value === branch) ?? null;
  const showBranchSpecify = branchNeedsSpecify(branch);

  function handleStudyingChange(value: string) {
    setCurrentlyStudying(value);
    if (value !== "other") {
      setReviewerRelation("");
      setReviewerRelationOther("");
    }
  }

  function handleDegreeLevelChange(value: string) {
    setDegreeLevel(value);
    setBranch("");
    setBranchOther("");
  }

  function handleBranchChange(value: string) {
    setBranch(value);
    if (!branchNeedsSpecify(value)) setBranchOther("");
  }

  function setCriterion(id: CriteriaId, value: number) {
    setManualCriteria((prev) => ({ ...prev, [id]: true }));
    setCriteriaRatings((prev) => ({ ...prev, [id]: value }));
    if (mode === "advanced") {
      setExpanded((prev) => ({ ...prev, [id]: true }));
    }
  }

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function setDetailRating(criterionId: CriteriaId, key: string, value: number) {
    const nextDetails = { ...detailRatings, [key]: value };
    setDetailRatings(nextDetails);

    if (manualCriteria[criterionId]) return;

    const criterion = CRITERIA.find((c) => c.id === criterionId);
    if (!criterion) return;

    const avg = averageDetailRatings(criterion, nextDetails);
    setCriteriaRatings((prev) => ({ ...prev, [criterionId]: avg ?? 0 }));
  }

  function toggleExpanded(id: CriteriaId) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetForm() {
    setOverallRating(0);
    setCriteriaRatings(emptyRatings(CRITERIA.map((c) => c.id)));
    setDetailRatings(emptyRatings(collectRatingIds(CRITERIA)));
    setAnswers({});
    setExpanded(mode === "advanced" ? expandInitialAdvanced() : {});
    setManualCriteria({});
    setCurrentlyStudying("");
    setReviewerRelation("");
    setReviewerRelationOther("");
    setComment("");
    setDegreeLevel("");
    setBranch("");
    setBranchOther("");
    setAdmissionYear("");
    setGraduationYear("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (overallRating === 0) {
      toast.error("Please give an overall rating.");
      return;
    }

    if (currentlyStudying === "other") {
      if (!reviewerRelation) {
        toast.error("Please tell us how you are related to this college.");
        return;
      }
      if (reviewerRelation === "other" && !reviewerRelationOther.trim()) {
        toast.error("Please briefly describe your relation.");
        return;
      }
    }

    if (mode === "advanced") {
      if (!degreeLevel) {
        toast.error("Please select a degree level.");
        return;
      }
      if (!branch) {
        toast.error("Please select a branch / specialization.");
        return;
      }
      if (showBranchSpecify && !branchOther.trim()) {
        toast.error("Please specify your branch / specialization.");
        return;
      }
      if (!answers.wasPlaced) {
        toast.error("Please say whether you were placed.");
        return;
      }
    }

    setVerifySession((n) => n + 1);
    setShowVerifyFlow(true);
  }

  const shortName =
    institutionName.length > 40
      ? `${institutionName.slice(0, 40)}…`
      : institutionName;

  function renderDetailQuestion(
    criterionId: CriteriaId,
    question: DetailQuestion
  ) {
    if (question.type === "rating") {
      const key = `${criterionId}.${question.id}`;
      return (
        <CriteriaRow
          key={key}
          nested
          label={question.label}
          value={detailRatings[key] ?? 0}
          onChange={(value) => setDetailRating(criterionId, key, value)}
        />
      );
    }

    if (question.type === "tiles") {
      return (
        <div key={question.id} className="review-criteria__detail-block">
          <Label className="college-review-form__question">
            {question.label}
            {question.required && (
              <span className="review-criteria__required">*</span>
            )}
          </Label>
          <TileRadioGroup
            name={`${criterionId}-${question.id}`}
            value={answers[question.id] ?? ""}
            onChange={(value) => setAnswer(question.id, value)}
            options={question.options}
            columns={question.columns}
          />
        </div>
      );
    }

    if (question.type === "select") {
      return (
        <div key={question.id} className="review-criteria__detail-block">
          <Label className="college-review-form__question">{question.label}</Label>
          <Select
            value={answers[question.id] ?? ""}
            onValueChange={(value) => setAnswer(question.id, value ?? "")}
          >
            <SelectTrigger className="college-review-form__select" size="default">
              <SelectValue placeholder={question.placeholder ?? "Select"}>
                {answers[question.id]
                  ? (question.options.find(
                      (option) => option.value === answers[question.id]
                    )?.label ?? answers[question.id])
                  : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (question.type === "conditional-text") {
      if (answers[question.when.questionId] !== question.when.equals) {
        return null;
      }
      return (
        <div key={question.id} className="review-criteria__detail-block">
          <Label
            htmlFor={`${criterionId}-${question.id}`}
            className="college-review-form__question"
          >
            {question.label}
          </Label>
          <Textarea
            id={`${criterionId}-${question.id}`}
            placeholder={question.placeholder}
            value={answers[question.id] ?? ""}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            rows={question.rows ?? 3}
          />
        </div>
      );
    }

    if (question.type === "conditional-row") {
      if (answers[question.when.questionId] !== question.when.equals) {
        return null;
      }
      return (
        <div
          key={question.id}
          className="college-review-form__section--row review-criteria__detail-block"
        >
          {question.fields.map((field) => (
            <DetailFieldInput
              key={field.id}
              field={field}
              value={answers[field.id] ?? ""}
              onChange={(value) => setAnswer(field.id, value)}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        key={question.id}
        className="college-review-form__section--row review-criteria__detail-block"
      >
        {question.fields.map((field) => (
          <DetailFieldInput
            key={field.id}
            field={field}
            value={answers[field.id] ?? ""}
            onChange={(value) => setAnswer(field.id, value)}
          />
        ))}
      </div>
    );
  }

  return (
    <form className="college-review-form" onSubmit={handleSubmit}>
      <section className="college-review-form__section college-review-form__section--mode">
        <div className="review-mode-toggle" role="tablist" aria-label="Review type">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "quick"}
            className={`review-mode-toggle__btn${mode === "quick" ? " review-mode-toggle__btn--active" : ""}`}
            onClick={() => {
              setMode("quick");
              setExpanded({});
            }}
          >
            Quick review
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "advanced"}
            className={`review-mode-toggle__btn${mode === "advanced" ? " review-mode-toggle__btn--active" : ""}`}
            onClick={() => {
              setMode("advanced");
              setExpanded(expandInitialAdvanced());
            }}
          >
            Advanced review
          </button>
        </div>
      </section>

      <section className="college-review-form__section">
        <CriteriaRow
          label="Overall rating"
          value={overallRating}
          onChange={setOverallRating}
          required
        />
      </section>

      <section className="college-review-form__section">
        <h3 className="college-review-form__heading">Rate {shortName}</h3>
        <div className="review-criteria">
          {CRITERIA.map((criterion) => {
            const details =
              mode === "advanced" && criterion.detailQuestions
                ? criterion.detailQuestions
                : null;
            const isOpen = Boolean(details && expanded[criterion.id]);

            return (
              <div
                key={criterion.id}
                className={`review-criteria__item${isOpen ? " review-criteria__item--open" : ""}`}
              >
                <div className="review-criteria__row">
                  {details ? (
                    <button
                      type="button"
                      className="review-criteria__expand"
                      aria-expanded={isOpen}
                      onClick={() => toggleExpanded(criterion.id)}
                    >
                      <span className="review-criteria__label">
                        {criterion.label}
                      </span>
                      <ChevronDown
                        className={`review-criteria__chevron${isOpen ? " review-criteria__chevron--open" : ""}`}
                        aria-hidden
                      />
                    </button>
                  ) : (
                    <span className="review-criteria__label">
                      {criterion.label}
                    </span>
                  )}
                  <StarRating
                    value={criteriaRatings[criterion.id] ?? 0}
                    onChange={(value) => setCriterion(criterion.id, value)}
                    compact
                  />
                </div>

                {details && (
                  <div
                    className={`review-criteria__details${isOpen ? " review-criteria__details--open" : ""}`}
                    hidden={!isOpen}
                  >
                    {details.map((question) =>
                      renderDetailQuestion(criterion.id, question)
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="college-review-form__section">
        <Label className="college-review-form__question">
          Do you currently study here?
        </Label>
        <TileRadioGroup
          name="currently-studying"
          value={currentlyStudying}
          onChange={handleStudyingChange}
          columns={3}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No (alumni)" },
            { value: "other", label: "Other" },
          ]}
        />

        {currentlyStudying === "other" && (
          <div className="college-review-form__other-relation">
            <div className="college-review-form__field">
              <Label className="college-review-form__question">
                How are you related to this college?
                <span className="review-criteria__required">*</span>
              </Label>
              <p className="college-review-form__hint">
                Friend, parent, or someone else filling this on their behalf.
              </p>
              <Select
                value={reviewerRelation}
                onValueChange={(value) => {
                  setReviewerRelation(value ?? "");
                  if (value !== "other") setReviewerRelationOther("");
                }}
              >
                <SelectTrigger
                  className="college-review-form__select"
                  size="default"
                >
                  <SelectValue placeholder="Select relation">
                    {reviewerRelation === "friend"
                      ? "Friend of a student"
                      : reviewerRelation === "parent"
                        ? "Parent / guardian"
                        : reviewerRelation === "sibling"
                          ? "Sibling"
                          : reviewerRelation === "counselor"
                            ? "Counselor / mentor"
                            : reviewerRelation === "other"
                              ? "Other (describe)"
                              : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friend">Friend of a student</SelectItem>
                  <SelectItem value="parent">Parent / guardian</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="counselor">Counselor / mentor</SelectItem>
                  <SelectItem value="other">Other (describe)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reviewerRelation === "other" && (
              <div className="college-review-form__field">
                <Label
                  htmlFor="reviewer-relation-other"
                  className="college-review-form__question"
                >
                  Describe your relation
                  <span className="review-criteria__required">*</span>
                </Label>
                <Input
                  id="reviewer-relation-other"
                  className="college-review-form__input"
                  placeholder="e.g. Visiting faculty, recruiter, sibling of alumni…"
                  value={reviewerRelationOther}
                  onChange={(e) => setReviewerRelationOther(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {mode === "advanced" && (
        <>
          <section className="college-review-form__section">
            <div className="college-review-form__field">
              <Label className="college-review-form__question">
                Degree level
              </Label>
              <Select
                value={degreeLevel}
                onValueChange={(value) =>
                  handleDegreeLevelChange(value ?? "")
                }
              >
                <SelectTrigger
                  className="college-review-form__select"
                  size="default"
                >
                  <SelectValue placeholder="Select degree level">
                    {degreeLevel ? getDegreeLevelLabel(degreeLevel) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="college-review-form__section">
            <div className="college-review-form__field">
              <Label className="college-review-form__question">
                Branch / specialization
              </Label>
              <Combobox
                items={branchOptions}
                value={selectedBranch}
                onValueChange={(item) =>
                  handleBranchChange(
                    item && typeof item === "object" && "value" in item
                      ? String(item.value)
                      : ""
                  )
                }
                disabled={!degreeLevel}
              >
                <ComboboxInput
                  className="college-review-form__combobox"
                  placeholder={
                    degreeLevel
                      ? "Search branch / specialization…"
                      : "Select degree level first"
                  }
                  disabled={!degreeLevel}
                  showClear={Boolean(selectedBranch)}
                />
                <ComboboxContent className="college-review-form__branch-menu">
                  <ComboboxEmpty>No branch found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {showBranchSpecify && (
              <div className="college-review-form__field">
                <Label
                  htmlFor="branch-other"
                  className="college-review-form__question"
                >
                  Please specify
                  <span className="review-criteria__required">*</span>
                </Label>
                <Input
                  id="branch-other"
                  className="college-review-form__input"
                  placeholder="e.g. Instrumentation Engineering"
                  value={branchOther}
                  onChange={(e) => setBranchOther(e.target.value)}
                />
              </div>
            )}
          </section>

          <section className="college-review-form__section">
            <Label className="college-review-form__question">
              Batch (admission – graduation year)
            </Label>
            <div className="college-review-form__section--row">
              <div className="college-review-form__field">
                <Label
                  htmlFor="admission-year"
                  className="college-review-form__question college-review-form__question--subtle"
                >
                  Admission year
                </Label>
                <Input
                  id="admission-year"
                  type="number"
                  min={1980}
                  max={2100}
                  className="college-review-form__input"
                  placeholder="e.g. 2021"
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(e.target.value)}
                />
              </div>
              <div className="college-review-form__field">
                <Label
                  htmlFor="graduation-year"
                  className="college-review-form__question college-review-form__question--subtle"
                >
                  Graduation year
                </Label>
                <Input
                  id="graduation-year"
                  type="number"
                  min={1980}
                  max={2100}
                  className="college-review-form__input"
                  placeholder="e.g. 2025"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                />
              </div>
            </div>
          </section>
        </>
      )}

      <section className="college-review-form__section">
        <Label htmlFor="comment" className="college-review-form__question">
          Your review
        </Label>
        <Textarea
          id="comment"
          placeholder="Say what actually happened."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
        />
      </section>

      <div className="college-review-form__actions">
        <Button type="submit" size="lg">
          {mode === "advanced" ? "Submit advanced review" : "Submit review"}
        </Button>
      </div>

      <Dialog
        open={showVerifyFlow}
        onOpenChange={(open) => {
          if (!open) setShowVerifyFlow(false);
        }}
      >
        <DialogContent className="review-verify-dialog" showCloseButton>
          <DialogTitle className="sr-only">Submit review verification</DialogTitle>
          <DialogDescription className="sr-only">
            Choose visibility, verify email, and complete affiliation checks
            before publishing your review.
          </DialogDescription>
          {showVerifyFlow ? (
            <ReviewVerifyFlow
              key={verifySession}
              institutionName={institutionName}
              onComplete={() => {
                setShowVerifyFlow(false);
                resetForm();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </form>
  );
}
