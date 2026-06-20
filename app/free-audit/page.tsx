import type { Metadata } from "next";
import FreeAuditPage from "./FreeAuditPage";

export const metadata: Metadata = {
  title:
    "Free Dental Review Audit — Reveal Your Clinic's Reputation Blind Spots | ReviewFlow",
  description:
    "Get a 5-minute audit comparing your Google & Yelp reviews against 3 local competitors. Identify negative trends, benchmark competitors, and uncover revenue lost to low ratings. No credit card required.",
  openGraph: {
    title:
      "Free Dental Review Audit — Reveal Your Clinic's Reputation Blind Spots",
    description:
      "Get a 5-minute audit to identify negative trends, competitor gaps, and lost revenue. Trusted by 500+ dental practices.",
    type: "website",
  },
};

export default function FreeAuditPageServer() {
  return <FreeAuditPage />;
}
