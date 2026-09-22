"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Play,
  Film,
  Mic,
  FileText,
  ExternalLink,
  Calendar,
  Tag,
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  LandingMediaItem,
  mediaApi,
  extractIframeSrc,
  extractIframeHeight,
  isAudioIframe,
} from "@/lib/media-api";
import { CustomAudioPlayer } from "@/components/media/CustomAudioPlayer";

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

function getYouTubeEmbedUrl(url?: string, autoplay = false): string | null {
  if (!url) return null;
  try {
    const id = getYouTubeVideoId(url);
    if (id) {
      return `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&rel=0`;
    }
    if (url.includes("youtube.com/embed/")) {
      const clean = url.split("?")[0];
      return `${clean}?autoplay=${autoplay ? 1 : 0}&rel=0`;
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

function getYouTubeWatchUrl(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
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

function getVimeoEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo.*\/(\d+)/i);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
}

function getEpisodeBadge(title?: string, index = 0): string {
  if (!title) return `EP. ${String(index + 1).padStart(2, "0")}`;
  const epMatch = title.match(/Ep\.?\s*#?(\d+)/i);
  if (epMatch && epMatch[1]) {
    return `EP. ${epMatch[1].padStart(2, "0")}`;
  }
  return `EP. ${String(index + 1).padStart(2, "0")}`;
}

function getEpisodeDuration(item: LandingMediaItem, index = 0): string {
  const match = item.description?.match(/(\d{1,2}:\d{2})/);
  if (match) return match[1];
  const durations = ["32:10", "28:45", "31:20", "26:18", "34:05", "22:30", "29:15", "35:40"];
  return durations[index % durations.length];
}

function getGuestName(title?: string): string | null {
  if (!title) return null;
  const match = title.match(/Ep\.?\s*#?\d+[:\s-]*(.*)/i);
  if (match && match[1] && match[1].trim()) {
    return match[1].trim();
  }
  return null;
}

type MediaTab = "luminaries" | "additional" | "reports" | "audio";

const MEDIA_TABS: { id: MediaTab; label: string }[] = [
  { id: "luminaries", label: "Luminaries Podcasts" },
  { id: "additional", label: "Additional Videos & Podcasts" },
  { id: "reports", label: "PDF Market Reports" },
  { id: "audio", label: "Audio Podcasts" },
];

function MediaSphereContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<LandingMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MediaTab>("luminaries");

  // Luminaries states
  const [selectedLuminariesVideo, setSelectedLuminariesVideo] = useState<LandingMediaItem | null>(null);
  const [isPlayingLuminaries, setIsPlayingLuminaries] = useState(false);
  const [showFullLuminariesDesc, setShowFullLuminariesDesc] = useState(false);

  // Additional videos states
  const [selectedAdditionalVideo, setSelectedAdditionalVideo] = useState<LandingMediaItem | null>(null);
  const [isPlayingAdditional, setIsPlayingAdditional] = useState(false);
  const [showFullAdditionalDesc, setShowFullAdditionalDesc] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await mediaApi.getMedia({ status: "published", featured: true });
        const list = Array.isArray(data) ? data : [];
        setItems(list);

        const vids = list.filter((i) => i.mediaType === "video");
        const lumList = vids.filter((v) => {
          const cat = (v.category || "").toLowerCase();
          return cat.includes("luminaries") || (!cat.includes("additional") && !cat.includes("special"));
        });
        const addList = vids.filter((v) => {
          const cat = (v.category || "").toLowerCase();
          return cat.includes("additional") || cat.includes("special");
        });

        if (lumList.length > 0) {
          setSelectedLuminariesVideo(lumList[0]);
        }
        if (addList.length > 0) {
          setSelectedAdditionalVideo(addList[0]);
        }
      } catch (err) {
        console.error("Failed to load Media Sphere items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle direct navigation via URL query parameter ?id=...
  useEffect(() => {
    const targetId = searchParams.get("id");
    if (!targetId) return;

    const existing = items.find((i) => i.id === targetId);
    if (existing) {
      const cat = (existing.category || "").toLowerCase();
      const isAdd = cat.includes("additional") || cat.includes("special");
      if (isAdd) {
        setActiveTab("additional");
        setSelectedAdditionalVideo(existing);
        setIsPlayingAdditional(true);
      } else {
        setActiveTab("luminaries");
        setSelectedLuminariesVideo(existing);
        setIsPlayingLuminaries(true);
      }
      setTimeout(() => {
        document.getElementById("video-spotlight-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (!loading) {
      mediaApi.getMediaById(targetId).then((mediaItem) => {
        if (!mediaItem) return;
        const cat = (mediaItem.category || "").toLowerCase();
        const isAdd = cat.includes("additional") || cat.includes("special");
        if (isAdd) {
          setActiveTab("additional");
          setSelectedAdditionalVideo(mediaItem);
          setIsPlayingAdditional(true);
        } else {
          setActiveTab("luminaries");
          setSelectedLuminariesVideo(mediaItem);
          setIsPlayingLuminaries(true);
        }
        setTimeout(() => {
          document.getElementById("video-spotlight-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }).catch(console.error);
    }
  }, [searchParams, items, loading]);

  // Video subsets
  const luminariesVideos = useMemo(() => {
    return items.filter((i) => {
      if (i.mediaType !== "video") return false;
      const cat = (i.category || "").toLowerCase();
      return cat.includes("luminaries") || (!cat.includes("additional") && !cat.includes("special"));
    });
  }, [items]);

  const additionalVideos = useMemo(() => {
    return items.filter((i) => {
      if (i.mediaType !== "video") return false;
      const cat = (i.category || "").toLowerCase();
      return cat.includes("additional") || cat.includes("special");
    });
  }, [items]);

  // Audio and PDF items
  const audios = useMemo(() => items.filter((i) => i.mediaType === "audio"), [items]);
  const documents = useMemo(() => items.filter((i) => i.mediaType === "document"), [items]);

  const getEmbedUrl = (item: LandingMediaItem | null, autoplay = false) => {
    if (!item?.sourceUrl) return null;
    if (
      item.videoSource === "youtube" ||
      item.sourceUrl.includes("youtube") ||
      item.sourceUrl.includes("youtu.be")
    ) {
      return getYouTubeEmbedUrl(item.sourceUrl, autoplay);
    }
    if (item.videoSource === "vimeo" || item.sourceUrl.includes("vimeo")) {
      return getVimeoEmbedUrl(item.sourceUrl);
    }
    return null;
  };

  const luminariesEmbedUrl = useMemo(
    () => getEmbedUrl(selectedLuminariesVideo, isPlayingLuminaries),
    [selectedLuminariesVideo, isPlayingLuminaries]
  );

  const additionalEmbedUrl = useMemo(
    () => getEmbedUrl(selectedAdditionalVideo, isPlayingAdditional),
    [selectedAdditionalVideo, isPlayingAdditional]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Global Landing Navbar */}
      <LandingHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-white border-b border-slate-200 py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Media <span className="text-[#B5111B]">Sphere</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-4xl mx-auto">
              Strategic real estate market intelligence, Luminaries video broadcasts, thought leadership podcasts, and downloadable market research authored by Kathleen Rose, CCIM, CRE.
            </p>

            {/* TAB SELECTION MENU */}
            <div className="pt-2 sm:pt-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {MEDIA_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                      isActive
                        ? "bg-[#B5111B] text-white shadow-sm border border-[#B5111B]"
                        : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div id="video-spotlight-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* SECTION 1: LUMINARIES PODCASTS (Image 1 UI Layout) */}
          {activeTab === "luminaries" && (
            <section id="luminaries-podcasts" className="space-y-6">
              {luminariesVideos.length === 0 && !loading ? (
                <div className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-12 text-center space-y-3">
                  <Film className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">Luminaries Episodes In Production</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Episodes are recorded and curated regularly. Add new Luminaries episodes in the CMS dashboard.
                  </p>
                </div>
              ) : selectedLuminariesVideo ? (
                /* MAIN CONTAINER CARD MATCHING IMAGE 1 */
                <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 border border-slate-200/80 shadow-xs">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* LEFT COLUMN (~65%): Video Player + Editorial Details */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-5">
                      {/* 16:9 Aspect Video Box */}
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-xs group select-none">
                        {isPlayingLuminaries ? (
                          <div className="w-full h-full relative bg-black">
                            {luminariesEmbedUrl ? (
                              <iframe
                                src={luminariesEmbedUrl}
                                title={selectedLuminariesVideo.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : selectedLuminariesVideo.sourceUrl ? (
                              <video
                                src={selectedLuminariesVideo.sourceUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain bg-black"
                              />
                            ) : null}

                            <button
                              type="button"
                              onClick={() => setIsPlayingLuminaries(false)}
                              className="absolute top-3 right-3 bg-black/80 hover:bg-black text-white text-[11px] font-semibold tracking-wide px-3 py-1.5 rounded-lg backdrop-blur-xs border border-white/20 transition cursor-pointer flex items-center gap-1.5 shadow-md z-20"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cover View</span>
                            </button>
                          </div>
                        ) : (
                          /* Cover View with Branding, Play Button, and Mock Player Bar (Image 1) */
                          <div
                            onClick={() => setIsPlayingLuminaries(true)}
                            className="w-full h-full relative cursor-pointer"
                          >
                            <img
                              src={
                                getYouTubeThumbnail(selectedLuminariesVideo.sourceUrl) ||
                                "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80"
                              }
                              alt={selectedLuminariesVideo.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                            />

                            {/* Subtle Dark Hover Tint */}
                            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/30 transition-colors" />

                            {/* Center Frosted Circular Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 backdrop-blur-xs border border-white/40 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-[#B5111B] group-hover:border-[#B5111B] transition-all duration-300">
                                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Editorial Details Below Player */}
                      <div className="space-y-3 pt-1">
                        <div>
                          <span className="text-[11px] font-extrabold text-[#B5111B] uppercase tracking-widest block mb-1">
                            FEATURED EPISODE
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            {selectedLuminariesVideo.title}
                          </h2>
                        </div>

                        {selectedLuminariesVideo.description && (
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                              {showFullLuminariesDesc
                                ? selectedLuminariesVideo.description
                                : selectedLuminariesVideo.description.slice(0, 260) +
                                  (selectedLuminariesVideo.description.length > 260 ? "..." : "")}
                              {selectedLuminariesVideo.description.length > 260 && (
                                <button
                                  type="button"
                                  onClick={() => setShowFullLuminariesDesc(!showFullLuminariesDesc)}
                                  className="text-[#B5111B] hover:text-[#8F0D15] text-xs font-bold cursor-pointer inline-block ml-1.5"
                                >
                                  {showFullLuminariesDesc ? "Show Less" : "Read More ˇ"}
                                </button>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Metadata Row */}
                        <div className="flex items-center gap-5 text-xs text-slate-500 font-medium pt-0.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatEpisodeDate(selectedLuminariesVideo.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedLuminariesVideo.category || "Luminaries Podcasts"}</span>
                          </div>
                        </div>

                        {/* Action Buttons (Watch Episode & Watch on YouTube) */}
                        <div className="flex items-center gap-3 pt-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setIsPlayingLuminaries(true)}
                            className="bg-[#B5111B] hover:bg-[#8F0D15] text-white px-5 sm:px-6 py-2.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Watch Episode</span>
                          </button>

                          {getYouTubeWatchUrl(selectedLuminariesVideo.sourceUrl) && (
                            <a
                              href={getYouTubeWatchUrl(selectedLuminariesVideo.sourceUrl)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                            >
                              <span className="w-4 h-3 bg-red-600 rounded-[3px] flex items-center justify-center">
                                <span className="w-0 h-0 border-y-[2.5px] border-y-transparent border-l-[4px] border-l-white ml-0.5" />
                              </span>
                              <span>Watch on YouTube</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN (~35%): Featured Episodes List with View All */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">Featured Episodes</h3>
                        <Link
                          href="/videos/all?category=luminaries"
                          className="text-xs sm:text-sm font-bold text-[#B5111B] hover:text-[#8F0D15] flex items-center gap-1 hover:underline transition-colors"
                        >
                          <span>View All</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="space-y-2.5 mt-3.5 max-h-[640px] overflow-y-auto pr-1">
                        {luminariesVideos.map((ep, idx) => {
                          const isSelected = selectedLuminariesVideo.id === ep.id;
                          const thumb =
                            getYouTubeThumbnail(ep.sourceUrl) ||
                            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80";

                          return (
                            <div
                              key={ep.id}
                              onClick={() => {
                                setSelectedLuminariesVideo(ep);
                                setIsPlayingLuminaries(false);
                                setShowFullLuminariesDesc(false);
                              }}
                              className={`p-2.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer border ${
                                isSelected
                                  ? "bg-red-50/70 border-red-200/90 shadow-2xs"
                                  : "bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="w-20 sm:w-24 aspect-video rounded-xl overflow-hidden relative shrink-0 bg-slate-900 shadow-2xs">
                                <img
                                  src={thumb}
                                  alt={ep.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {getEpisodeBadge(ep.title, idx)}
                                </div>
                                <div className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-medium px-1.5 py-0.5 rounded">
                                  {getEpisodeDuration(ep, idx)}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`text-xs sm:text-sm font-bold line-clamp-1 transition-colors ${
                                    isSelected ? "text-[#B5111B]" : "text-slate-900 hover:text-[#B5111B]"
                                  }`}
                                >
                                  {ep.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{formatEpisodeDate(ep.createdAt)}</span>
                                </div>
                              </div>

                              {/* Chevron */}
                              <ChevronRight
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  isSelected ? "text-[#B5111B]" : "text-slate-300"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {/* SECTION 2: ADDITIONAL VIDEOS & PODCASTS (Image 1 UI Layout) */}
          {activeTab === "additional" && (
            <section id="additional-videos" className="space-y-6">
              {additionalVideos.length === 0 && !loading ? (
                <div className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-12 text-center space-y-3">
                  <Film className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No Additional Videos Published Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Webinars and presentations will appear here as soon as they are assigned to this category in the CMS.
                  </p>
                </div>
              ) : selectedAdditionalVideo ? (
                /* MAIN CONTAINER CARD MATCHING IMAGE 1 */
                <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 border border-slate-200/80 shadow-xs">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* LEFT COLUMN (~65%): Video Player + Editorial Details */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-5">
                      {/* 16:9 Aspect Video Box */}
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-xs group select-none">
                        {isPlayingAdditional ? (
                          <div className="w-full h-full relative bg-black">
                            {additionalEmbedUrl ? (
                              <iframe
                                src={additionalEmbedUrl}
                                title={selectedAdditionalVideo.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : selectedAdditionalVideo.sourceUrl ? (
                              <video
                                src={selectedAdditionalVideo.sourceUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain bg-black"
                              />
                            ) : null}

                            <button
                              type="button"
                              onClick={() => setIsPlayingAdditional(false)}
                              className="absolute top-3 right-3 bg-black/80 hover:bg-black text-white text-[11px] font-semibold tracking-wide px-3 py-1.5 rounded-lg backdrop-blur-xs border border-white/20 transition cursor-pointer flex items-center gap-1.5 shadow-md z-20"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cover View</span>
                            </button>
                          </div>
                        ) : (
                          /* Cover View with Branding, Play Button, and Mock Player Bar (Image 1) */
                          <div
                            onClick={() => setIsPlayingAdditional(true)}
                            className="w-full h-full relative cursor-pointer"
                          >
                            <img
                              src={
                                getYouTubeThumbnail(selectedAdditionalVideo.sourceUrl) ||
                                "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80"
                              }
                              alt={selectedAdditionalVideo.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                            />

                            {/* Subtle Dark Hover Tint */}
                            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/30 transition-colors" />

                            {/* Center Frosted Circular Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 backdrop-blur-xs border border-white/40 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-[#B5111B] group-hover:border-[#B5111B] transition-all duration-300">
                                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Editorial Details Below Player */}
                      <div className="space-y-3 pt-1">
                        <div>
                          <span className="text-[11px] font-extrabold text-[#B5111B] uppercase tracking-widest block mb-1">
                            FEATURED VIDEO
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            {selectedAdditionalVideo.title}
                          </h2>
                        </div>

                        {selectedAdditionalVideo.description && (
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                              {showFullAdditionalDesc
                                ? selectedAdditionalVideo.description
                                : selectedAdditionalVideo.description.slice(0, 260) +
                                  (selectedAdditionalVideo.description.length > 260 ? "..." : "")}
                              {selectedAdditionalVideo.description.length > 260 && (
                                <button
                                  type="button"
                                  onClick={() => setShowFullAdditionalDesc(!showFullAdditionalDesc)}
                                  className="text-[#B5111B] hover:text-[#8F0D15] text-xs font-bold cursor-pointer inline-block ml-1.5"
                                >
                                  {showFullAdditionalDesc ? "Show Less" : "Read More ˇ"}
                                </button>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Metadata Row */}
                        <div className="flex items-center gap-5 text-xs text-slate-500 font-medium pt-0.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatEpisodeDate(selectedAdditionalVideo.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedAdditionalVideo.category || "Additional Videos"}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setIsPlayingAdditional(true)}
                            className="bg-[#B5111B] hover:bg-[#8F0D15] text-white px-5 sm:px-6 py-2.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Watch Video</span>
                          </button>

                          {getYouTubeWatchUrl(selectedAdditionalVideo.sourceUrl) && (
                            <a
                              href={getYouTubeWatchUrl(selectedAdditionalVideo.sourceUrl)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                            >
                              <span className="w-4 h-3 bg-red-600 rounded-[3px] flex items-center justify-center">
                                <span className="w-0 h-0 border-y-[2.5px] border-y-transparent border-l-[4px] border-l-white ml-0.5" />
                              </span>
                              <span>Watch on YouTube</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN (~35%): Featured Episodes List with View All */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">Featured Videos</h3>
                        <Link
                          href="/videos/all?category=additional"
                          className="text-xs sm:text-sm font-bold text-[#B5111B] hover:text-[#8F0D15] flex items-center gap-1 hover:underline transition-colors"
                        >
                          <span>View All</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="space-y-2.5 mt-3.5 max-h-[640px] overflow-y-auto pr-1">
                        {additionalVideos.map((ep, idx) => {
                          const isSelected = selectedAdditionalVideo.id === ep.id;
                          const thumb =
                            getYouTubeThumbnail(ep.sourceUrl) ||
                            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80";

                          return (
                            <div
                              key={ep.id}
                              onClick={() => {
                                setSelectedAdditionalVideo(ep);
                                setIsPlayingAdditional(false);
                                setShowFullAdditionalDesc(false);
                              }}
                              className={`p-2.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer border ${
                                isSelected
                                  ? "bg-red-50/70 border-red-200/90 shadow-2xs"
                                  : "bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="w-20 sm:w-24 aspect-video rounded-xl overflow-hidden relative shrink-0 bg-slate-900 shadow-2xs">
                                <img
                                  src={thumb}
                                  alt={ep.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {getEpisodeBadge(ep.title, idx)}
                                </div>
                                <div className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-medium px-1.5 py-0.5 rounded">
                                  {getEpisodeDuration(ep, idx)}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`text-xs sm:text-sm font-bold line-clamp-1 transition-colors ${
                                    isSelected ? "text-[#B5111B]" : "text-slate-900 hover:text-[#B5111B]"
                                  }`}
                                >
                                  {ep.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{formatEpisodeDate(ep.createdAt)}</span>
                                </div>
                              </div>

                              {/* Chevron */}
                              <ChevronRight
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  isSelected ? "text-[#B5111B]" : "text-slate-300"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {/* SECTION 3: PDF MARKET REPORTS SHELF */}
          {activeTab === "reports" && (
            <section id="market-reports" className="space-y-6">
              {documents.length === 0 && !loading ? (
                <div className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-12 text-center space-y-3">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No PDF Market Reports Uploaded Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    PDF reports will appear here as soon as they are uploaded in the CMS Media Sphere module under Rose/Media/PDF.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#B5111B] group-hover:scale-105 transition">
                            <FileText className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                            PDF Report
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#B5111B] transition line-clamp-2 leading-snug">
                            {doc.title}
                          </h3>
                        </div>

                        {doc.description && (
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      {/* Open in New Tab Action */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-400 font-bold">
                          Kathleen Rose, CCIM, CRE
                        </span>
                        {doc.sourceUrl && (
                          <a
                            href={doc.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#B5111B] hover:bg-[#8F0D15] text-white shadow-xs transition group/btn cursor-pointer"
                          >
                            <span>Open Report</span>
                            <ExternalLink className="w-3.5 h-3.5 text-white/90 group-hover/btn:translate-x-0.5 transition" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SECTION 4: AUDIO PODCAST SUITE */}
          {activeTab === "audio" && (
            <section id="audio-podcasts" className="space-y-6">
              {audios.length === 0 && !loading ? (
                <div className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-12 text-center space-y-3">
                  <Mic className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No Audio Podcasts Published Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    MP3 audio files and external stream links will display in this bespoke audio console once added in the CMS.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  {audios.map((podcast) => {
                    const isIframe = isAudioIframe(podcast.sourceUrl, podcast.audioSource);
                    if (isIframe) {
                      const src = extractIframeSrc(podcast.sourceUrl || "");
                      const height = extractIframeHeight(podcast.sourceUrl || "", 180);
                      return (
                        <div
                          key={podcast.id}
                          className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition space-y-4 text-slate-900"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8F0D15] to-[#B5111B] flex items-center justify-center shrink-0 border border-rose-200 shadow-xs text-white font-black">
                              RA
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] font-black uppercase tracking-wider text-[#B5111B]">
                                  {podcast.category || "Audio Broadcast"}
                                </span>
                              </div>
                              <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug line-clamp-2">
                                {podcast.title}
                              </h4>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 shadow-2xs">
                            <iframe
                              src={src}
                              title={podcast.title}
                              width="100%"
                              height={height}
                              className="w-full border-0 block bg-white"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                            />
                          </div>

                          {podcast.description && (
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                              {podcast.description}
                            </p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <CustomAudioPlayer
                        key={podcast.id}
                        src={podcast.sourceUrl || ""}
                        title={podcast.title}
                        subtitle={podcast.category || "Rose Associates Strategic Audio Series"}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Global Landing Footer */}
      <LandingFooter />
    </div>
  );
}

export default function MediaSpherePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B5111B]" />
      </div>
    }>
      <MediaSphereContent />
    </Suspense>
  );
}
