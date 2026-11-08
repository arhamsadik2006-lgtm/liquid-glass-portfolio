export type CategoryId =
  | "commercial"
  | "motion-graphics"
  | "brand-explainers"
  | "vfx-3d"
  | "documentary"
  | "short-form";

export type Tool =
  | "After Effects"
  | "Premiere Pro"
  | "DaVinci Resolve"
  | "Photoshop"
  | "Illustrator"
  | "Cinema 4D"
  | "Blender"
  | "Remotion"
  | "Audition"
  | "Figma";

export type DockGroup = "ae" | "ps" | "ai";
export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";

export interface Project {
  slug: string;
  index: number;
  title: string;
  client: string;
  category: CategoryId;
  label: string;
  runtime: string;
  year: number;
  thumbnail: string;
  videoUrl: string;
  aspectRatio: AspectRatio;
  tools: Tool[];
  dock: DockGroup[];
  accent: string;
  summary: string;
  breakdown: string[];
  results: { label: string; value: string }[];
  testimonial: { quote: string; author: string; role: string };
  views: number;
  featured: boolean;
}

export interface Category {
  id: CategoryId;
  title: string;
  subtitle: string;
  rating: number;
  videoUrl: string;
  poster: string;
  gradient: string;
}

export const PROFILE = {
  name: "Arham Sadik",
  role: "Video Editor & Motion Graphics Artist",
  email: "arhamsadik2006@gmail.com",
  instagram: "https://instagram.com/posting_until_a_brand_hires_me",
  instagramHandle: "@posting_until_a_brand_hires_me",
  hoursEdited: "1,290+",
  availability: "Available for Commissions",
  portrait: "/images/arham-portrait.jpg",
};
export const SHOWREEL = {
  title: "Arham Sadik — Official Showreel",
  runtime: "1:00",
  videoUrl: "/videos/showreel.mp4",
  poster: "/images/showreel-poster.jpg",
};

export const CATEGORIES: Category[] = [
  {
    id: "motion-graphics",
    title: "Motion Graphics",
    subtitle: "After Effects & kinetic systems",
    rating: 5.0,
    videoUrl: "/videos/cat-motion.mp4",
    poster: "/images/project-1.jpg",
    gradient: "linear-gradient(160deg,#ff7a18 0%,#af002d 55%,#319197 100%)",
  },
  {
    id: "brand-explainers",
    title: "Animated Explainers",
    subtitle: "Remotion & SaaS storytelling",
    rating: 5.0,
    videoUrl: "/videos/cat-explainers.mp4",
    poster: "/images/project-2.jpg",
    gradient: "linear-gradient(160deg,#4f46e5 0%,#06b6d4 100%)",
  },
  {
    id: "commercial",
    title: "Commercial Showreel",
    subtitle: "High-retention brand edits",
    rating: 5.0,
    videoUrl: "/videos/showreel.mp4",
    poster: "/images/showreel-poster.jpg",
    gradient: "linear-gradient(160deg,#f43f5e 0%,#a855f7 55%,#0ea5e9 100%)",
  },
  {
    id: "vfx-3d",
    title: "3D & Compositing",
    subtitle: "React Three Fiber & VFX",
    rating: 4.9,
    videoUrl: "/videos/cat-3d.mp4",
    poster: "/images/project-3.jpg",
    gradient: "linear-gradient(160deg,#22c55e 0%,#0f766e 50%,#1e1b4b 100%)",
  },
  {
    id: "documentary",
    title: "Narrative & Pacing",
    subtitle: "Story-driven long-form edits",
    rating: 4.9,
    videoUrl: "/videos/cat-doc.mp4",
    poster: "/images/project-4.jpg",
    gradient: "linear-gradient(160deg,#f59e0b 0%,#b45309 50%,#1c1917 100%)",
  },
];

export const EXTRA_CATEGORY: Category[] = [
  {
    id: "short-form",
    title: "Short-Form Viral",
    subtitle: "Reels, Shorts & retention hooks",
    rating: 5.0,
    videoUrl: "/videos/cat-shorts.mp4",
    poster: "/images/project-5.jpg",
    gradient: "linear-gradient(160deg,#ec4899 0%,#8b5cf6 100%)",
  }
];

export const ALL_CATEGORIES: Category[] = [...CATEGORIES, ...EXTRA_CATEGORY];

export function getCategory(id: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}

type Seed = Omit<Project, "index" | "breakdown" | "results" | "testimonial" | "featured"> &
  Partial<Pick<Project, "breakdown" | "results" | "testimonial" | "featured">>;
const SEEDS: Seed[] = [
  {
    slug: "remotion-animated-explainer",
    title: "Programmatic Animated Explainer",
    client: "GigaDigital",
    category: "brand-explainers",
    label: "REMOTION EXPLAINER",
    runtime: "1:15",
    year: 2026,
    thumbnail: "/images/project-1.jpg",
    videoUrl: "/videos/project-1.mp4",
    aspectRatio: "16:9",
    tools: ["Remotion", "After Effects", "Figma"],
    dock: ["ae"],
    accent: "#22d3ee",
    summary: "Code-driven animated explainer video built with Remotion and After Effects for high-converting SaaS onboarding.",
    breakdown: [
      "Script & storyboard mapping key product value propositions.",
      "Custom React + Remotion animation components with spring physics.",
      "After Effects compositing, sound design, and 4K master delivery.",
    ],
    results: [
      { label: "Retention", value: "84%" },
      { label: "Resolution", value: "4K 60fps" },
      { label: "Turnaround", value: "4 days" },
    ],
    testimonial: {
      quote: "Delivered a super clean, high-retention animated explainer ahead of schedule.",
      author: "Client Review",
      role: "Founder",
    },
    views: 150000,
    featured: true,
  },
  {
    slug: "motion-graphics-brand-reel",
    title: "High-Contrast Motion Reel",
    client: "GigaDigital Agency",
    category: "motion-graphics",
    label: "MOTION GRAPHICS",
    runtime: "0:45",
    year: 2026,
    thumbnail: "/images/project-2.jpg",
    videoUrl: "/videos/project-2.mp4",
    aspectRatio: "16:9",
    tools: ["After Effects", "Premiere Pro", "Illustrator"],
    dock: ["ae", "ai"],
    accent: "#a855f7",
    summary: "Fast-paced kinetic typography and sleek dark-mode UI motion graphics engineered for brand awareness.",
    views: 95000,
    featured: true,
  },
  {
    slug: "project-3-title",
    title: "Project Three Title",
    client: "Client Name",
    category: "commercial",
    label: "COMMERCIAL EDIT",
    runtime: "0:30",
    year: 2026,
    thumbnail: "/images/project-3.jpg",
    videoUrl: "/videos/project-3.mp4", // Make sure this video exists in your folder!
    aspectRatio: "16:9",
    tools: ["Premiere Pro", "DaVinci Resolve"],
    dock: [],
    accent: "#f43f5e",
    summary: "High-energy commercial cut showcasing dynamic transitions and custom sound design.",
    views: 120000,
    featured: true,
  },
  {
    slug: "project-4-title",
    title: "Project Four Title",
    client: "Brand Name",
    category: "vfx-3d",
    label: "3D VISUALS",
    runtime: "0:40",
    year: 2026,
    thumbnail: "/images/project-4.jpg",
    videoUrl: "/videos/project-4.mp4", // Make sure this video exists in your folder!
    aspectRatio: "16:9",
    tools: ["Blender", "After Effects"],
    dock: ["ae"],
    accent: "#22c55e",
    summary: "Photoreal 3D product renders combined with dynamic lighting and camera movements.",
    views: 85000,
    featured: false,
  },
  {
    slug: "project-5-title",
    title: "Project Five Title",
    client: "Creator Name",
    category: "short-form",
    label: "SHORT-FORM REEL",
    runtime: "0:55",
    year: 2026,
    thumbnail: "/images/project-5.jpg",
    videoUrl: "/videos/project-5.mp4", // Make sure this video exists in your folder!
    aspectRatio: "16:9",
    tools: ["Premiere Pro", "After Effects"],
    dock: ["ae"],
    accent: "#ec4899",
    summary: "Retention-optimized short-form content featuring custom motion graphic captions.",
    views: 500000,
    featured: true,
  }
];

function fmtViews(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;
}

export const PROJECTS: Project[] = SEEDS.map((s, i) => ({
  ...s,
  index: i + 1,
  featured: s.featured ?? true,
  breakdown: s.breakdown ?? [
    `Concept & hook strategy tailored for ${s.client}.`,
    `Timeline assembly and rhythm lock in ${s.tools[0]}.`,
    `Motion design, color grade, and sound polish.`,
  ],
  results: s.results ?? [
    { label: "Views", value: fmtViews(s.views) },
    { label: "Retention", value: "75%+" },
    { label: "Delivery", value: "4K Master" },
  ],
  testimonial: s.testimonial ?? {
    quote: "Smooth communication and sharp editing instincts from first cut to final master.",
    author: s.client,
    role: "Client",
  },
}));

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export interface ProjectQuery {
  q?: string | null;
  category?: string | null;
  tool?: string | null;
  dock?: string | null;
  featured?: boolean;
}

export function queryProjects({ q, category, tool, dock, featured }: ProjectQuery, list: Project[] = PROJECTS): Project[] {
  const needle = q?.trim().toLowerCase();
  return list.filter((p) => {
    if (category && category !== "all" && p.category !== category) return false;
    if (tool && !p.tools.some((t) => t.toLowerCase() === tool.toLowerCase())) return false;
    if (dock && !p.dock.includes(dock as DockGroup)) return false;
    if (featured && !p.featured) return false;
    if (needle) {
      const hay = `${p.title} ${p.client} ${p.label} ${p.category} ${p.tools.join(" ")} ${p.summary}`.toLowerCase();
      return needle.split(/\s+/).every((w) => hay.includes(w));
    }
    return true;
  });
}

export const DOCK_FILTERS: Record<DockGroup, { label: string; description: string }> = {
  ae: { label: "After Effects", description: "Motion Graphics & VFX" },
  ps: { label: "Photoshop", description: "Thumbnail Design & Visual Direction" },
  ai: { label: "Illustrator", description: "Vector Assets & Brand Storyboards" },
};