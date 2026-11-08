import { Hero } from "@/components/hero/Hero";
import { DeckSection } from "@/components/deck/DeckSection";
import { DesktopSection } from "@/components/desktop/DesktopSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function HomePage() {
  return (
    <main className="relative">
      <ErrorBoundary label="hero">
        <Hero />
      </ErrorBoundary>
      <ErrorBoundary label="deck-section">
        <DeckSection />
      </ErrorBoundary>
      <ErrorBoundary label="desktop">
        <DesktopSection />
      </ErrorBoundary>
      <ContactSection />
    </main>
  );
}
