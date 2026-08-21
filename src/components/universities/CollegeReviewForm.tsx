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

import "@/styles/university-detail.css";

type TileOption = { value: string; label: string };
type WizardStep = 1 | 2 | 3 | 4;

type CategoryId =
  | "academics"
  | "faculty"
  | "infrastructure"
  | "placements"
  | "campusLife"
  | "administration"
  | "hostelFees";

type CategoryDraft = {
  sentiment: string;
  pros: string;
  cons: string;
};

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
  { value: "impressed", label: "Genuinely impressed" },
  { value: "prettyGood", label: "Pretty good" },
  { value: "okay", label: "It was okay" },
  { value: "fellShort", label: "Fell short" },
  { value: "disappointing", label: "Deeply disappointing" },
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
const MIN_WORDS = 5;

interface CollegeReviewFormProps {
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

export function CollegeReviewForm({
  institutionName,
  onChangeCollege,
}: CollegeReviewFormProps) {
  const [step, setStep] = useState<WizardStep>(1);

  const [degreeLevel, setDegreeLevel] = useState("");
  const [branch, setBranch] = useState("");
  const [branchOther, setBranchOther] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [status, setStatus] = useState("");
  const [reviewerRelation, setReviewerRelation] = useState("");
  const [reviewerRelationOther, setReviewerRelationOther] = useState("");
  const [fullyAnonymous, setFullyAnonymous] = useState(true);

  const [activeCategory, setActiveCategory] = useState<CategoryId>("academics");
  const [categoryDrafts, setCategoryDrafts] = useState<
    Record<CategoryId, CategoryDraft>
  >(() =>
    Object.fromEntries(
      CATEGORIES.map((c) => [c.id, emptyDraft()])
    ) as Record<CategoryId, CategoryDraft>
  );

  const [recommend, setRecommend] = useState("");
  const [recommendReason, setRecommendReason] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [overallSentiment, setOverallSentiment] = useState("");
  const [expectationGap, setExpectationGap] = useState("");

  const [showVerifyFlow, setShowVerifyFlow] = useState(false);
  const [verifySession, setVerifySession] = useState(0);

  const branchOptions = getBranchOptions(degreeLevel);
  const selectedBranch =
    branchOptions.find((option) => option.value === branch) ?? null;
  const showBranchSpecify = branchNeedsSpecify(branch);
  const draft = categoryDrafts[activeCategory];
  const prosWords = wordCount(draft.pros);
  const consWords = wordCount(draft.cons);

  const filledCategories = CATEGORIES.filter((c) => {
    const d = categoryDrafts[c.id];
    return (
      d.sentiment &&
      wordCount(d.pros) >= MIN_WORDS &&
      wordCount(d.cons) >= MIN_WORDS
    );
  }).length;

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
    setStatus("");
    setReviewerRelation("");
    setReviewerRelationOther("");
    setFullyAnonymous(true);
    setActiveCategory("academics");
    setCategoryDrafts(
      Object.fromEntries(
        CATEGORIES.map((c) => [c.id, emptyDraft()])
      ) as Record<CategoryId, CategoryDraft>
    );
    setRecommend("");
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
    if (filledCategories < 1) {
      toast.error(
        `Fill at least one category with a rating, pros (≥${MIN_WORDS} words), and cons (≥${MIN_WORDS} words).`
      );
      return false;
    }
    return true;
  }

  function validateStep3(): boolean {
    if (!recommend) {
      toast.error("Please choose a recommendation.");
      return false;
    }
    return true;
  }

  function validateStep4(): boolean {
    if (!oneLiner.trim()) {
      toast.error("Please sum up your experience in one line.");
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

  return (
    <form
      className="college-review-form"
      onSubmit={(e) => {
        e.preventDefault();
        goContinue();
      }}
    >
      <p className="college-review-form__hint" aria-live="polite">
        Step {step} of {TOTAL_STEPS} · {progressPct}%
      </p>

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

            <div className="college-review-form__field">
              <Label
                htmlFor="batch-year"
                className="college-review-form__question"
              >
                Batch year
              </Label>
              <Input
                id="batch-year"
                type="number"
                min={1980}
                max={2100}
                className="college-review-form__input"
                placeholder="e.g. 2024"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
              />
            </div>
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
            <div className="review-tiles" data-columns="1" role="group">
              <label
                className={`review-tile${fullyAnonymous ? " review-tile--active" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={fullyAnonymous}
                  onChange={(e) => setFullyAnonymous(e.target.checked)}
                />
                <span>Fully Anonymous</span>
              </label>
            </div>
            <p className="college-review-form__hint">
              No program, specialization, or batch year shown publicly.
            </p>
          </section>
        </>
      )}

      {step === 2 && (
        <>
          <section className="college-review-form__section">
            <h3 className="college-review-form__heading">
              Share your experience in detail
            </h3>
            <p className="college-review-form__hint">
              Pick a category and fill it in. At least one required ({filledCategories}{" "}
              filled).
            </p>
            <TileRadioGroup
              name="category"
              value={activeCategory}
              onChange={(value) => setActiveCategory(value as CategoryId)}
              columns={2}
              options={CATEGORIES.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
            />
          </section>

          <section className="college-review-form__section">
            <Label className="college-review-form__question">
              How was {CATEGORIES.find((c) => c.id === activeCategory)?.label}?
            </Label>
            <TileRadioGroup
              name={`sentiment-${activeCategory}`}
              value={draft.sentiment}
              onChange={(value) => updateDraft({ sentiment: value })}
              columns={1}
              options={SENTIMENT_OPTIONS}
            />
          </section>

          <section className="college-review-form__section">
            <div className="college-review-form__field">
              <Label htmlFor="pros" className="college-review-form__question">
                Pros (Tell the positive aspects)
              </Label>
              <Textarea
                id="pros"
                placeholder="Write your message…"
                value={draft.pros}
                onChange={(e) => updateDraft({ pros: e.target.value })}
                rows={4}
              />
              <p className="college-review-form__hint">
                {prosWords >= MIN_WORDS
                  ? `${prosWords} words ✓`
                  : `At least ${MIN_WORDS} words`}
              </p>
            </div>

            <div className="college-review-form__field">
              <Label htmlFor="cons" className="college-review-form__question">
                Cons (Tell the negative aspects)
              </Label>
              <Textarea
                id="cons"
                placeholder="Write your message…"
                value={draft.cons}
                onChange={(e) => updateDraft({ cons: e.target.value })}
                rows={4}
              />
              <p className="college-review-form__hint">
                {consWords >= MIN_WORDS
                  ? `${consWords} words ✓`
                  : `At least ${MIN_WORDS} words`}
              </p>
            </div>
          </section>
        </>
      )}

      {step === 3 && (
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
            columns={1}
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

      {step === 4 && (
        <>
          <section className="college-review-form__section">
            <h3 className="college-review-form__heading">Sum it up</h3>
            <div className="college-review-form__field">
              <Label
                htmlFor="one-liner"
                className="college-review-form__question"
              >
                Sum up your experience in one line
              </Label>
              <Input
                id="one-liner"
                className="college-review-form__input"
                placeholder={`I really love ${institutionName}`}
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
              />
            </div>
          </section>

          <section className="college-review-form__section">
            <Label className="college-review-form__question">
              Overall, how would you describe your time here?
            </Label>
            <TileRadioGroup
              name="overall-sentiment"
              value={overallSentiment}
              onChange={setOverallSentiment}
              columns={1}
              options={SENTIMENT_OPTIONS}
            />
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
