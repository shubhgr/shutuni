"use client";

import { useState } from "react";
import { MapPin, PenLine, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CollegeReviewForm } from "@/components/universities/CollegeReviewForm";
import type { InstitutionDetail, Programme } from "@/lib/institutions-types";

import "@/styles/university-detail.css";

interface InstitutionDetailViewProps {
  institution: InstitutionDetail;
}

function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatUniversity(university?: string): string | null {
  if (!university || university === "NOT APPLICABLE") return null;
  return university;
}

function formatLevel(level: string): string {
  return level
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function CoursesTable({ programmes }: { programmes: Programme[] }) {
  if (programmes.length === 0) {
    return (
      <p className="university-detail__courses-empty">
        No course information available for this institution.
      </p>
    );
  }

  return (
    <div className="university-detail__courses-table">
      <Table>
        <colgroup>
          <col className="university-detail__col-course" />
          <col className="university-detail__col-programme" />
          <col className="university-detail__col-level" />
          <col className="university-detail__col-availability" />
          <col className="university-detail__col-intake" />
        </colgroup>
        <TableHeader>
          <TableRow className="university-detail__table-head-row">
            <TableHead>Course</TableHead>
            <TableHead>Programme</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Intake</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programmes.map((programme, index) => (
            <TableRow key={`${programme.course}-${index}`}>
              <TableCell className="university-detail__course-name" data-label="Course">
                {programme.course}
              </TableCell>
              <TableCell
                className="university-detail__programme"
                data-label="Programme"
              >
                {programme.programme}
              </TableCell>
              <TableCell className="university-detail__level" data-label="Level">
                <span className="university-detail__level-badge">
                  {formatLevel(programme.level)}
                </span>
              </TableCell>
              <TableCell
                className="university-detail__availability"
                data-label="Availability"
              >
                {programme.availability}
              </TableCell>
              <TableCell
                className="university-detail__intake"
                data-label="Intake"
              >
                {programme.intake || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function InstitutionDetailView({ institution }: InstitutionDetailViewProps) {
  const [activeTab, setActiveTab] = useState("about");
  const courseCount = institution.programmes.length;
  const university = formatUniversity(institution.university);
  const initials = getInitials(institution.name);

  return (
    <article className="university-detail">
      <header className="university-detail__profile">
        <div className="university-detail__cover" aria-hidden />

        <div className="university-detail__profile-body">
          <div className="university-detail__profile-top">
            <div className="university-detail__logo" aria-hidden>
              {initials}
            </div>

            <div className="university-detail__profile-actions">
              <Button
                type="button"
                size="sm"
                onClick={() => setActiveTab("review")}
              >
                <PenLine aria-hidden />
                Write a review
              </Button>
            </div>
          </div>

          <div className="university-detail__profile-info">
            <h1 className="university-detail__title">{institution.name}</h1>

            <div className="university-detail__rating-row">
              <Star className="university-detail__rating-star" aria-hidden />
              <span className="university-detail__rating-value">—</span>
              <span className="university-detail__rating-meta">
                based on 0 reviews
              </span>
            </div>

            <p className="university-detail__location">
              <MapPin className="university-detail__location-icon" aria-hidden />
              {institution.district}, {institution.state}
            </p>
          </div>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="university-detail__tabs"
      >
        <TabsList className="university-detail__tab-list" variant="line">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="review">Write a review</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="university-detail__tab-panel">
          <div className="university-detail__about">
            <section className="university-detail__block">
              <h2 className="university-detail__block-title">
                About this institution
              </h2>
              <p className="university-detail__summary">{institution.address}</p>

              <div className="university-detail__tags">
                {institution.institution_type && (
                  <span className="university-detail__tag">
                    {institution.institution_type}
                  </span>
                )}
                {institution.category && (
                  <span className="university-detail__tag">{institution.category}</span>
                )}
                {institution.university_tier && (
                  <span className="university-detail__tag">
                    {institution.university_tier}
                  </span>
                )}
                {institution.college_score != null && (
                  <span className="university-detail__tag">
                    Score {institution.college_score}
                  </span>
                )}
                <span className="university-detail__tag">{institution.state}</span>
                <span className="university-detail__tag">{institution.district}</span>
                {courseCount > 0 && (
                  <span className="university-detail__tag">
                    {courseCount} {courseCount === 1 ? "course" : "courses"}
                  </span>
                )}
              </div>

              {university && (
                <p className="university-detail__affiliation">
                  Affiliated to <strong>{university}</strong>
                </p>
              )}
            </section>

            <section className="university-detail__block university-detail__block--courses">
              <div className="university-detail__block-header">
                <h2 className="university-detail__block-title">Courses offered</h2>
                <span className="university-detail__course-count">
                  {courseCount} total
                </span>
              </div>
              <CoursesTable programmes={institution.programmes} />
            </section>
          </div>
        </TabsContent>

        <TabsContent value="review" className="university-detail__tab-panel">
          <div className="university-detail__block">
            <h2 className="university-detail__block-title">Write a review</h2>
            <p className="university-detail__summary">
              Share an honest review to help students choose the right college.
            </p>
            <CollegeReviewForm
              institutionId={institution.id}
              institutionName={institution.name}
            />
          </div>
        </TabsContent>
      </Tabs>
    </article>
  );
}
