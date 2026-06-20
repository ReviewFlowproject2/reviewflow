import type { Metadata } from "next";
import FreeAuditPage from "./FreeAuditPage";

export const metadata: Metadata = {
  title: "Free Dental Review Audit — See How Your Clinic Compares | ReviewFlow",
  description:
    "Enter your clinic name and get a personalized report comparing your Google & Yelp reviews against 3 local competitors. No credit card required. 200+ dental clinics trust ReviewFlow.",
  openGraph: {
    title: "Free Dental Review Audit — See How Your Clinic Compares",
    description:
      "Get a personalized report comparing your Google & Yelp reviews against 3 local competitors. Free, no credit card required.",
    type: "website",
  },
};

export default function FreeAuditPageServer() {
  return <FreeAuditPage />;
}
