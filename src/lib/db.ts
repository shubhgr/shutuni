import { neon } from "@neondatabase/serverless";
import { randomBytes } from "crypto";

function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return url;
}

export function getSql() {
  return neon(requireDatabaseUrl());
}

let schemaReady: Promise<void> | null = null;

export async function ensureReviewSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS reviewers (
          id UUID PRIMARY KEY,
          linkedin_sub TEXT UNIQUE,
          display_name TEXT NOT NULL,
          email TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY,
          institution_id TEXT NOT NULL,
          institution_name TEXT NOT NULL,
          reviewer_id UUID REFERENCES reviewers(id),
          fully_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
          degree_level TEXT NOT NULL,
          branch TEXT NOT NULL,
          branch_other TEXT,
          batch_year TEXT NOT NULL,
          status TEXT NOT NULL,
          reviewer_relation TEXT,
          reviewer_relation_other TEXT,
          overall_sentiment TEXT NOT NULL,
          expectation_gap TEXT,
          one_liner TEXT NOT NULL,
          recommend TEXT NOT NULL,
          recommend_reason TEXT,
          categories JSONB NOT NULL DEFAULT '{}'::jsonb,
          verification_method TEXT NOT NULL,
          college_email TEXT,
          document_type TEXT,
          document_filename TEXT,
          document_size INTEGER,
          document_url TEXT,
          display_name TEXT NOT NULL,
          linkedin_sub TEXT,
          linkedin_email TEXT,
          moderation_status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS reviews_institution_id_idx
        ON reviews (institution_id)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS reviews_created_at_idx
        ON reviews (created_at DESC)
      `;
      await sql`
        ALTER TABLE reviews
        ADD COLUMN IF NOT EXISTS document_url TEXT
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export function newId() {
  // UUID v4-ish without extra deps
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
