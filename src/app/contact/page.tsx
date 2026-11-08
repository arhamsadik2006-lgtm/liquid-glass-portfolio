import type { Metadata } from "next";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send Arham Sadik a project brief or book a discovery call.",
};

export default function ContactPage() {
  return (
    <main className="pt-16">
      <ContactSection source="contact-page" />
    </main>
  );
}
