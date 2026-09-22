"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Play,
  Film,
  Calendar,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  LandingMediaItem,
  mediaApi,
} from "@/lib/media-api";

function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
  } catch (e) {
    return null;
  }
  return null;
}

function getYouTubeThumbnail(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function formatEpisodeDate(dateString?: string): string {
  if (!dateString) return "Mar 2024";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Mar 2024";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Mar 2024";
  }
}

function getEpisodeBadge(title?: string, index = 0): string {
  if (!title) return `EP. ${String(index + 1).padStart(2, "0")}`;
  const epMatch = title.match(/Ep\.?\s*#?(\d+)/i);
  if (epMatch && epMatch[1]) {
    return `EP. ${epMatch[1].padStart(2, "0")}`;
  }
  return `EP. ${String(index + 1).padStart(2, "0")}`;
}

type VideoCategory = "luminaries" | "additional" | "all";

function ViewAllVideosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState<VideoCategory>(
    categoryParam === "additional" ? "additional" : categoryParam === "all" ? "all" : "luminaries"
  );
  const [items, setItems] = useState<LandingMediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync category state if URL query parameter changes
  useEffect(() => {
    if (categoryParam === "additional") {
      setActiveCategory("additional");
    } else if (categoryParam === "all") {
      setActiveCategory("all");
    } else if (categoryParam === "luminaries") {
      setActiveCategory("luminaries");
    }
  }, [categoryParam]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch only published videos that are NOT featured on the landing page
        const data = await mediaApi.getMedia({
          mediaType: "video",
          status: "published",
          featured: false,
        });

        // Ensure strict filtering on client side as well
        const nonFeaturedPublished = (Array.isArray(data) ? data : []).filter(
          (item) => item.mediaType === "video" && item.status === "published" && !item.featured
        );

        setItems(nonFeaturedPublished);
      } catch (err) {
        console.error("Failed to load non-featured published videos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter items by category
  const filteredVideos = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((v) => {
      const cat = (v.category || "").toLowerCase();
      if (activeCategory === "luminaries") {
        return cat.includes("luminaries") || (!cat.includes("additional") && !cat.includes("special"));
      }
      return cat.includes("additional") || cat.includes("special");
    });
  }, [items, activeCategory]);

  const handleCardClick = (videoId: string) => {
    // Option A: Navigate to /videos?id=[id] to play in main spotlight player
    router.push(`/videos?id=${encodeURIComponent(videoId)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Global Landing Navbar */}
      <LandingHeader />

      <main className="flex-1">
        {/* HEADER SECTION */}
        <section className="bg-white border-b border-slate-200 py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/videos"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B5111B] hover:text-[#8F0D15] hover:underline mb-4 transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Featured Spotlight</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                  {activeCategory === "luminaries"
                    ? "All Luminaries Podcast Episodes"
                    : activeCategory === "additional"
                    ? "All Additional Videos & Presentations"
                    : "All Video Archive"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 max-w-2xl">
                  Browse through all published episodes and presentations. Click any card to launch and watch in the main spotlight player.
                </p>
              </div>

              {/* CATEGORY SWITCHER TABS (Without extra filter buttons) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveCategory("luminaries")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    activeCategory === "luminaries"
                      ? "bg-[#B5111B] text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Luminaries
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("additional")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    activeCategory === "additional"
                      ? "bg-[#B5111B] text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Additional Videos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    activeCategory === "all"
                      ? "bg-[#B5111B] text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  All Archive
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5-COLUMN GRID SECTION (Image 2 UI Layout) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B5111B]" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-12 text-center space-y-3 max-w-lg mx-auto">
              <Film className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Archived Episodes</h3>
              <p className="text-xs text-slate-500">
                All currently published episodes are featured on the main video showcase, or new episodes have not yet been published.
              </p>
              <Link
                href="/videos"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#B5111B] text-white hover:bg-[#8F0D15] transition mt-2 cursor-pointer shadow-xs"
              >
                <span>Return to Featured Videos</span>
              </Link>
            </div>
          ) : (
            /* 5-COLUMN RESPONSIVE GRID MATCHING IMAGE 2 */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
              {filteredVideos.map((vid, idx) => {
                const thumb =
                  getYouTubeThumbnail(vid.sourceUrl) ||
                  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80";
                const epBadge = getEpisodeBadge(vid.title, idx + 1);

                return (
                  <div
                    key={vid.id}
                    onClick={() => handleCardClick(vid.id)}
                    className="group cursor-pointer flex flex-col text-left transition rounded-2xl p-2.5 -m-2.5 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100"
                  >
                    {/* 16:9 Thumbnail Box */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-2xs mb-2.5">
                      <img
                        src={thumb}
                        alt={vid.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                      />

                      {/* Top-Left Episode Pill (e.g. EP. 02, EP. 03) */}
                      <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                        {epBadge}
                      </div>

                      {/* Center Red Play Button Overlay (Matching Image 2) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-red-600/90 group-hover:bg-[#B5111B] text-white flex items-center justify-center shadow-md group-hover:scale-115 transition-transform duration-300">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Episode Title */}
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#B5111B] transition-colors line-clamp-2 leading-snug">
                      {vid.title}
                    </h3>

                    {/* Description / Synopsis Snippet */}
                    {vid.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                        {vid.description}
                      </p>
                    )}

                    {/* Metadata Footer: Date & Category Tag */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium mt-auto pt-2.5 border-t border-slate-100 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatEpisodeDate(vid.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{vid.category || "Luminaries"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Global Landing Footer */}
      <LandingFooter />
    </div>
  );
}

export default function ViewAllVideosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B5111B]" />
      </div>
    }>
      <ViewAllVideosContent />
    </Suspense>
  );
}
