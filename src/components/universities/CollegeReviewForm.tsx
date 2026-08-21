"use client";

import { useState } from "react";
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
import { ReviewVerifyFlow } from "@/components/universities/ReviewVerifyFlow";
import {
  DEGREE_LEVELS,
  branchNeedsSpecify,
  getBranchOptions,
  getDegreeLevelLabel,
} from "@/lib/review-degree-options";
import type {
  ReviewCategoryDraft,
  ReviewCategoryId,
  ReviewSubmitPayload,
} from "@/lib/review-types";

import "@/styles/university-detail.css";

type TileOption = { value: string; label: string };
type WizardStep = 1 | 2 | 3 | 4;
type CategoryId = ReviewCategoryId;
type CategoryDraft = ReviewCategoryDraft;

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "academics", label: "Academics" },
  { id: "faculty", label: "Faculty" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "placements", label: "Placements" },
  { id: "campusLife", label: "Campus Life" },
  { id: "administration", label: "Administration" },
  { id: "hostelFees", label: "Hostel & Fees" },
];

const SENTIMENT_OPTIONS: TileOption[] = [
  { value: "disappointing", label: "Deeply disappointing" },
  { value: "fellShort", label: "Fell short" },
  { value: "okay", label: "It was okay" },
  { value: "prettyGood", label: "Pretty good" },
  { value: "impressed", label: "Genuinely impressed" },
];

const STATUS_OPTIONS: TileOption[] = [
  { value: "studying", label: "Currently Studying" },
  { value: "graduated", label: "Graduated" },
  { value: "other", label: "Other" },
];

const RECOMMEND_OPTIONS: TileOption[] = [
  { value: "yes", label: "Yes, of course" },
  { value: "no", label: "No I won’t recommend it to anyone" },
  { value: "depends", label: "Depends on some scenarios" },
];

const EXPECTATION_OPTIONS: TileOption[] = [
  { value: "promised", label: "Didn’t match what was promised" },
  { value: "expectations", label: "Just fell below my expectations" },
];

const TOTAL_STEPS = 5;

const CURRENT_YEAR = new Date().getFullYear();
const BATCH_YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR + 6 - 1980 + 1 },
  (_, i) => {
    const year = String(CURRENT_YEAR + 6 - i);
    return { value: year, label: year };
  }
);

interface CollegeReviewFormProps {
  institutionId: string;
  institutionName: string;
  onChangeCollege?: () => void;
}

function emptyDraft(): CategoryDraft {
  return { sentiment: "", pros: "", cons: "" };
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
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
  columns?: 1 | 2 | 3;
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

function SentimentSlider({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const activeIndex = SENTIMENT_OPTIONS.findIndex((o) => o.value === value);
  const hasValue = activeIndex >= 0;

  return (
    <div
      className="review-sentiment-slider"
      role="radiogroup"
      aria-label={name}
    >
      <div className="review-sentiment-slider__rail" aria-hidden>
        <span className="review-sentiment-slider__track" />
        {SENTIMENT_OPTIONS.map((option, index) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={option.label}
              className={`review-sentiment-slider__point${active ? " review-sentiment-slider__point--active" : ""}`}
              style={{ left: `${(index / (SENTIMENT_OPTIONS.length - 1)) * 100}%` }}
              onClick={() => onChange(option.value)}
            >
              <span className="review-sentiment-slider__dot" />
            </button>
          );
        })}
        {hasValue ? (
          <span
            className="review-sentiment-slider__thumb-float"
            style={{
              left: `${(activeIndex / (SENTIMENT_OPTIONS.length - 1)) * 100}%`,
            }}
            aria-hidden
          />
        ) : null}
      </div>
      <div className="review-sentiment-slider__labels">
        {SENTIMENT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`review-sentiment-slider__label${value === option.value ? " review-sentiment-slider__label--active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CollegeReviewForm({
  institutionId,
  institutionName,
  onChangeCollege,
}: CollegeReviewFormProps) {
  const [step, setStep] = useState<WizardStep>(1);

  const [degreeLevel, setDegreeLevel] = useState("");
  const [branch, setBranch] = useState("");
  const [branchOther, setBranchOther] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [batchYearQuery, setBatchYearQuery] = useState("");
  const [status, setStatus] = useState("");
  const [reviewerRelation, setReviewerRelation] = useState("");
  const [reviewerRelationOther, setReviewerRelationOther] = useState("");
  const [fullyAnonymous, setFullyAnonymous] = useState(true);

  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [categoryDrafts, setCategoryDrafts] = useState<
    Record<CategoryId, CategoryDraft>
  >(() =>
    Object.fromEntries(
      CATEGORIES.map((c) => [c.id, emptyDraft()])
    ) as Record<CategoryId, CategoryDraft>
  );

  const [recommend, setRecommend] = useState("yes");
  const [recommendReason, setRecommendReason] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [overallSentiment, setOverallSentiment] = useState("");
  const [expectationGap, setExpectationGap] = useState("");

  const [showVerifyFlow, setShowVerifyFlow] = useState(false);
  const [verifySession, setVerifySession] = useState(0);

  const branchOptions = getBranchOptions(degreeLevel);
  const selectedBranch =
    branchOptions.find((option) => option.value === branch) ?? null;
  const selectedBatchYear =
    BATCH_YEAR_OPTIONS.find((option) => option.value === batchYear) ??
    (batchYear.trim()
      ? { value: batchYear.trim(), label: batchYear.trim() }
      : null);
  const batchYearItems = (() => {
    const typed = batchYearQuery.trim();
    if (
      /^\d{4}$/.test(typed) &&
      !BATCH_YEAR_OPTIONS.some((year) => year.value === typed)
    ) {
      return [{ value: typed, label: typed }, ...BATCH_YEAR_OPTIONS];
    }
    if (
      selectedBatchYear &&
      !BATCH_YEAR_OPTIONS.some((year) => year.value === selectedBatchYear.value)
    ) {
      return [selectedBatchYear, ...BATCH_YEAR_OPTIONS];
    }
    return BATCH_YEAR_OPTIONS;
  })();
  const showBranchSpecify = branchNeedsSpecify(branch);
  const draft = activeCategory
    ? categoryDrafts[activeCategory]
    : emptyDraft();
  const prosWords = wordCount(draft.pros);
  const consWords = wordCount(draft.cons);

  function isCategoryChecked(id: CategoryId): boolean {
    const d = categoryDrafts[id];
    return (
      Boolean(d.sentiment) ||
      wordCount(d.pros) >= 1 ||
      wordCount(d.cons) >= 1
    );
  }

  function handleStatusChange(value: string) {
    setStatus(value);
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

  function updateDraft(patch: Partial<CategoryDraft>) {
    if (!activeCategory) return;
    setCategoryDrafts((prev) => ({
      ...prev,
      [activeCategory]: { ...prev[activeCategory], ...patch },
    }));
  }

  function resetForm() {
    setStep(1);
    setDegreeLevel("");
    setBranch("");
    setBranchOther("");
    setBatchYear("");
    setBatchYearQuery("");
    setStatus("");
    setReviewerRelation("");
    setReviewerRelationOther("");
    setFullyAnonymous(true);
    setActiveCategory(null);
    setCategoryDrafts(
      Object.fromEntries(
        CATEGORIES.map((c) => [c.id, emptyDraft()])
      ) as Record<CategoryId, CategoryDraft>
    );
    setRecommend("yes");
    setRecommendReason("");
    setOneLiner("");
    setOverallSentiment("");
    setExpectationGap("");
  }

  function validateStep1(): boolean {
    if (!degreeLevel) {
      toast.error("Please select a program level.");
      return false;
    }
    if (!branch) {
      toast.error("Please select a specialization.");
      return false;
    }
    if (showBranchSpecify && !branchOther.trim()) {
      toast.error("Please specify your specialization.");
      return false;
    }
    if (!batchYear.trim()) {
      toast.error("Please enter your batch year.");
      return false;
    }
    if (!status) {
      toast.error("Please select your current status.");
      return false;
    }
    if (status === "other") {
      if (!reviewerRelation) {
        toast.error("Please tell us how you are related to this college.");
        return false;
      }
      if (reviewerRelation === "other" && !reviewerRelationOther.trim()) {
        toast.error("Please briefly describe your relation.");
        return false;
      }
    }
    return true;
  }

  function validateStep2(): boolean {
    if (!oneLiner.trim()) {
      toast.error("Please write a short overall review.");
      return false;
    }
    if (!overallSentiment) {
      toast.error("Please describe your overall experience.");
      return false;
    }
    if (
      (overallSentiment === "fellShort" ||
        overallSentiment === "disappointing") &&
      !expectationGap
    ) {
      toast.error("Please say how it fell short.");
      return false;
    }
    return true;
  }

  function validateStep3(): boolean {
    return true;
  }

  function validateStep4(): boolean {
    if (!recommend) {
      toast.error("Please choose a recommendation.");
      return false;
    }
    return true;
  }

  function goBack() {
    if (step === 1) {
      onChangeCollege?.();
      return;
    }
    setStep((s) => (s - 1) as WizardStep);
  }

  function goContinue() {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!validateStep2()) return;
      setActiveCategory(CATEGORIES[0]?.id ?? null);
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!validateStep3()) return;
      setStep(4);
      return;
    }
    if (!validateStep4()) return;
    setVerifySession((n) => n + 1);
    setShowVerifyFlow(true);
  }

  const showExpectationFollowUp =
    overallSentiment === "fellShort" || overallSentiment === "disappointing";
  const canGoBack = step > 1 || Boolean(onChangeCollege);
  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  function buildReviewPayload(): Omit<ReviewSubmitPayload, "verification"> {
    return {
      institutionId,
      institutionName,
      fullyAnonymous,
      degreeLevel,
      branch,
      branchOther: branchOther.trim() || undefined,
      batchYear: batchYear.trim(),
      status,
      reviewerRelation: reviewerRelation || undefined,
      reviewerRelationOther: reviewerRelationOther.trim() || undefined,
      overallSentiment,
      expectationGap: expectationGap || undefined,
      oneLiner: oneLiner.trim(),
      recommend,
      recommendReason: recommendReason.trim() || undefined,
      categories: categoryDrafts,
    };
  }

  return (
    <form
      className="college-review-form"
      onSubmit={(e) => {
        e.preventDefault();
        goContinue();
      }}
    >
      <div
        className="review-progress"
        aria-label={`Step ${step} of ${TOTAL_STEPS}, ${progressPct} percent`}
      >
        <div className="review-progress__meta">
          <span className="review-progress__step">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="review-progress__pct">{progressPct}%</span>
        </div>
        <div className="review-progress__track" role="presentation">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`review-progress__seg${i < step ? " review-progress__seg--done" : ""}`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <>
          <section className="college-review-form__section">
            <h3 className="college-review-form__heading">
              Tell us about your program
            </h3>

            <div className="college-review-form__field">
              <Label className="college-review-form__question">
                What level of program?
              </Label>
              <Select
                value={degreeLevel}
                onValueChange={(value) => handleDegreeLevelChange(value ?? "")}
              >
                <SelectTrigger
                  className="college-review-form__select"
                  size="default"
                >
                  <SelectValue placeholder="Select program level">
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

            <div className="college-review-form__section--row">
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
                        : "Select program level first"
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

              <div className="college-review-form__field">
                <Label className="college-review-form__question">
                  Batch year
                </Label>
                <Combobox
                  items={batchYearItems}
                  value={selectedBatchYear}
                  onValueChange={(item) => {
                    const next =
                      item && typeof item === "object" && "value" in item
                        ? String(item.value)
                        : "";
                    setBatchYear(next);
                    setBatchYearQuery(next);
                  }}
                  onInputValueChange={(value) => {
                    setBatchYearQuery(value);
                    if (/^\d{4}$/.test(value.trim())) {
                      setBatchYear(value.trim());
                    }
                  }}
                >
                  <ComboboxInput
                    className="college-review-form__combobox"
                    placeholder="Search or type year…"
                    showClear={Boolean(selectedBatchYear)}
                  />
                  <ComboboxContent className="college-review-form__branch-menu">
                    <ComboboxEmpty>No year found.</ComboboxEmpty>
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
            <Label className="college-review-form__question">Status</Label>
            <TileRadioGroup
              name="status"
              value={status}
              onChange={handleStatusChange}
              columns={3}
              options={STATUS_OPTIONS}
            />

            {status === "other" && (
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

          <section className="college-review-form__section">
            <Label className="college-review-form__question">Anonymity</Label>
            <label
              className={`review-anon${fullyAnonymous ? " review-anon--checked" : ""}`}
            >
              <input
                type="checkbox"
                className="review-anon__input"
                checked={fullyAnonymous}
                onChange={(e) => setFullyAnonymous(e.target.checked)}
              />
              <span className="review-anon__box" aria-hidden>
                {fullyAnonymous ? (
                  <svg
                    className="review-anon__check"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>
                ) : null}
              </span>
              <span className="review-anon__copy">
                <span className="review-anon__title">Fully Anonymous</span>
                <span className="review-anon__hint">
                  no program, specialization, or batch year shown publicly
                </span>
              </span>
            </label>
          </section>
        </>
      )}

      {step === 2 && (
        <>
          <section className="college-review-form__section">
            <h3 className="college-review-form__heading">Overall review</h3>
            <Label className="college-review-form__question">
              How would you describe your overall experience?
            </Label>
            <SentimentSlider
              name="overall-sentiment"
              value={overallSentiment}
              onChange={setOverallSentiment}
            />
          </section>

          <section className="college-review-form__section">
            <div className="college-review-form__field">
              <Label
                htmlFor="one-liner"
                className="college-review-form__question"
              >
                Write a short overall review
              </Label>
              <Textarea
                id="one-liner"
                placeholder={`I really love ${institutionName}`}
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
                rows={4}
              />
            </div>
          </section>

          {showExpectationFollowUp ? (
            <section className="college-review-form__section">
              <Label className="college-review-form__question">
                Did your college fall short of what was promised, or your
                expectations?
              </Label>
              <TileRadioGroup
                name="expectation-gap"
                value={expectationGap}
                onChange={setExpectationGap}
                columns={1}
                options={EXPECTATION_OPTIONS}
              />
            </section>
          ) : null}
        </>
      )}

      {step === 3 && (
        <>
          <section className="college-review-form__section">
            <h3 className="college-review-form__heading">
              Share your experience in detail
            </h3>
            <div
              className="review-tiles review-category-chips"
              data-columns="4"
              role="tablist"
              aria-label="Categories"
            >
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat.id;
                const done = isCategoryChecked(cat.id) && !active;
                return (
                  <div
                    key={cat.id}
                    className={`review-category-chip${active ? " review-category-chip--active" : ""}${done ? " review-category-chip--done" : ""}`}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className="review-category-chip__btn"
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {done ? (
                        <span className="review-category-chip__check" aria-hidden>
                          ✓
                        </span>
                      ) : null}
                      <span>{cat.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {activeCategory ? (
            <>
              <section className="college-review-form__section">
                <Label className="college-review-form__question">
                  How was{" "}
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label}?
                </Label>
                <SentimentSlider
                  name={`sentiment-${activeCategory}`}
                  value={draft.sentiment}
                  onChange={(value) => updateDraft({ sentiment: value })}
                />
              </section>

              <section className="college-review-form__section">
                <div className="college-review-form__field">
                  <Label htmlFor="pros" className="college-review-form__question">
                    Pros (Tell the positive aspects)
                  </Label>
                  <div className="review-wordbox">
                    <Textarea
                      id="pros"
                      className="review-wordbox__input"
                      placeholder="Write your message…"
                      value={draft.pros}
                      onChange={(e) => updateDraft({ pros: e.target.value })}
                      rows={4}
                    />
                    <span className="review-wordbox__count" aria-live="polite">
                      {prosWords} {prosWords === 1 ? "word" : "words"}
                    </span>
                  </div>
                </div>

                <div className="college-review-form__field">
                  <Label htmlFor="cons" className="college-review-form__question">
                    Cons (Tell the negative aspects)
                  </Label>
                  <div className="review-wordbox">
                    <Textarea
                      id="cons"
                      className="review-wordbox__input"
                      placeholder="Write your message…"
                      value={draft.cons}
                      onChange={(e) => updateDraft({ cons: e.target.value })}
                      rows={4}
                    />
                    <span className="review-wordbox__count" aria-live="polite">
                      {consWords} {consWords === 1 ? "word" : "words"}
                    </span>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <p className="college-review-form__hint">
              Select a category above to rate it and add pros &amp; cons.
            </p>
          )}
        </>
      )}

      {step === 4 && (
        <section className="college-review-form__section">
          <h3 className="college-review-form__heading">
            Your Final Recommendation
          </h3>
          <p className="college-review-form__hint">
            Would you recommend {institutionName}?
          </p>
          <TileRadioGroup
            name="recommend"
            value={recommend}
            onChange={setRecommend}
            columns={3}
            options={RECOMMEND_OPTIONS}
          />
          {recommend ? (
            <div className="college-review-form__field">
              <Label
                htmlFor="recommend-reason"
                className="college-review-form__question"
              >
                Any specific reason (optional)
              </Label>
              <Textarea
                id="recommend-reason"
                placeholder="Give a concise explanation"
                value={recommendReason}
                onChange={(e) => setRecommendReason(e.target.value)}
                rows={3}
              />
            </div>
          ) : null}
        </section>
      )}

      <div className="college-review-form__actions">
        {canGoBack ? (
          <Button type="button" variant="outline" size="lg" onClick={goBack}>
            Back
          </Button>
        ) : null}
        <Button type="submit" size="lg">
          Continue
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
            Verify your identity and complete affiliation checks before
            publishing your review.
          </DialogDescription>
          {showVerifyFlow ? (
            <ReviewVerifyFlow
              key={verifySession}
              institutionName={institutionName}
              fullyAnonymous={fullyAnonymous}
              reviewDraft={buildReviewPayload()}
              onComplete={() => {
                setShowVerifyFlow(false);
                resetForm();
                onChangeCollege?.();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </form>
  );
}
