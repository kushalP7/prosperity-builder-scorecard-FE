"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Film,
  Mic,
  FileText,
  Upload,
  CheckCircle,
  Trash2,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  LandingMediaItem,
  mediaApi,
  extractIframeSrc,
  extractIframeHeight,
  isAudioIframe,
} from "@/lib/media-api";

interface MediaFormProps {
  mediaId?: string;
}

const CATEGORY_PRESETS = [
  "Luminaries Podcasts",
  "Additional Videos & Podcasts",
  "Audio Podcasts",
  "Market Reports"
];

export function MediaForm({ mediaId }: MediaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!mediaId);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState<Partial<LandingMediaItem>>({
    title: "",
    mediaType: "video",
    videoSource: "youtube",
    audioSource: "iframe",
    sourceUrl: "",
    category: "Luminaries Podcasts",
    description: "",
    featured: false,
    status: "published",
  });

  const [stagedMediaFile, setStagedMediaFile] = useState<{
    file: File;
    type: "audio" | "video" | "pdf";
    previewUrl: string;
  } | null>(null);

  const cleanupStagedFile = () => {
    if (stagedMediaFile?.previewUrl?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(stagedMediaFile.previewUrl);
      } catch {}
    }
    setStagedMediaFile(null);
  };

  useEffect(() => {
    return () => {
      if (stagedMediaFile?.previewUrl?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(stagedMediaFile.previewUrl);
        } catch {}
      }
    };
  }, [stagedMediaFile]);

  useEffect(() => {
    async function loadMediaItem() {
      if (!mediaId) return;
      setLoading(true);
      try {
        const item = await mediaApi.getMediaById(mediaId);
        if (item) {
          const detectedAudioSource = item.audioSource || (isAudioIframe(item.sourceUrl, item.audioSource) ? "iframe" : "upload");
          setFormState({
            title: item.title,
            mediaType: item.mediaType || "video",
            videoSource: item.videoSource || "youtube",
            audioSource: detectedAudioSource,
            sourceUrl: item.sourceUrl || "",
            category: item.category || "Luminaries Podcasts",
            description: item.description || "",
            featured: item.featured || false,
            status: item.status || "published",
          });
        }
      } catch (err: any) {
        console.error("Failed to load media item:", err);
        setError("Media item not found or backend server is offline.");
      } finally {
        setLoading(false);
      }
    }
    loadMediaItem();
  }, [mediaId]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "audio" | "video" | "pdf",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous blob if any
    cleanupStagedFile();

    const previewUrl = URL.createObjectURL(file);
    setStagedMediaFile({ file, type, previewUrl });
    setError(null);

    const defaultName = file.name.replace(/\.[^/.]+$/, "");
    if (type === "pdf") {
      setFormState((prev) => ({
        ...prev,
        sourceUrl: previewUrl,
        title: prev.title || defaultName,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        sourceUrl: previewUrl,
      }));
    }
  };

  const handleSave = async (e?: React.FormEvent, forceStatus?: "published" | "draft") => {
    if (e) e.preventDefault();
    const effectiveTitle = formState.title?.trim();

    if (!effectiveTitle) {
      alert(
        formState.mediaType === "document"
          ? "Please provide a Report Title or upload a PDF document."
          : "Please provide a title for this media item."
      );
      return;
    }

    if (formState.mediaType === "document" && !formState.sourceUrl) {
      alert("Please upload or provide a PDF URL for document items.");
      return;
    }

    setIsSaving(true);
    setError(null);

    let finalSourceUrl = formState.sourceUrl || "";

    // If there is a staged media file matching the sourceUrl, upload it to Cloudinary upon save
    if (stagedMediaFile && formState.sourceUrl === stagedMediaFile.previewUrl) {
      const subfolderName = `Rose/Media/${stagedMediaFile.type.charAt(0).toUpperCase() + stagedMediaFile.type.slice(1)}`;
      setUploadingField(stagedMediaFile.type);
      setUploadStatusText(`Uploading ${stagedMediaFile.type.toUpperCase()} to ${subfolderName}...`);
      try {
        const res = await mediaApi.uploadMediaFile(stagedMediaFile.file, stagedMediaFile.type);
        if (!res?.url) {
          throw new Error("No URL returned from media upload service.");
        }
        finalSourceUrl = res.url;
        cleanupStagedFile();
      } catch (uploadErr: any) {
        setIsSaving(false);
        setUploadingField(null);
        setUploadStatusText(null);
        setError(uploadErr.message || `Upload failed. Could not upload file to ${subfolderName}.`);
        return;
      } finally {
        setUploadingField(null);
        setUploadStatusText(null);
      }
    }

    const finalStatus = forceStatus || formState.status || "published";
    let payload: any = {
      title: effectiveTitle,
      category: formState.category || (formState.mediaType === "document" ? "Market Reports" : "Luminaries Podcasts"),
      description: formState.description || "",
      featured: formState.featured || false,
      status: finalStatus,
      mediaType: formState.mediaType,
      sourceUrl: finalSourceUrl,
    };

    if (formState.mediaType === "document") {
      payload.videoSource = null;
      payload.audioSource = null;
    } else if (formState.mediaType === "audio") {
      payload.videoSource = null;
      payload.audioSource = formState.audioSource || "iframe";
    } else {
      payload.audioSource = null;
      payload.videoSource = formState.videoSource || "youtube";
    }

    try {
      if (mediaId) {
        await mediaApi.updateMedia(mediaId, payload);
      } else {
        await mediaApi.createMedia(payload);
      }
      router.push("/landing-cms?tab=media");
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save media item to database.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#B5111B] animate-spin" />
        <span className="text-xs font-bold text-slate-600">Loading media item details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full pb-20">
      {/* Sticky Header Bar */}
      <div className="sticky -top-4 sm:-top-6 z-30 bg-white border-b border-slate-200 py-3 sm:py-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/landing-cms?tab=media"
            onClick={cleanupStagedFile}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shrink-0"
            title="Back to Landing CMS"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate">
              {mediaId ? `Edit Media Item: ${formState.title || "Untitled"}` : "Create New Media Item"}
            </h1>
            <span className="hidden md:inline-block text-[11px] text-slate-500 font-medium truncate">
              Broadcast luxury video podcasts, audio episodes, and market PDF reports
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-end shrink-0">
          <Link
            href="/videos"
            target="_blank"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-[#B5111B]" />
            <span className="hidden xs:inline sm:inline">Preview</span>
          </Link>

          <button
            type="button"
            onClick={() => handleSave(undefined, "draft")}
            disabled={isSaving || !!uploadingField}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all disabled:opacity-50"
          >
            <span className="hidden xs:inline">Save </span>Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave(undefined, "published")}
            disabled={isSaving || !!uploadingField}
            className="bg-[#B5111B] hover:bg-[#8F0D15] text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-102 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadStatusText || "Saving..."}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{mediaId ? "Update Item" : "Publish to Sphere"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Layout */}
      <div className="w-full space-y-6">
        {/* 1. Media Type Selector */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            1. Select Media Format
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                cleanupStagedFile();
                setFormState((prev) => ({
                  ...prev,
                  mediaType: "video",
                  category:
                    prev.category === "Audio Podcasts" || prev.category === "Market Reports" || prev.category === "Market Momentum Reports"
                      ? "Luminaries Podcasts"
                      : prev.category,
                }));
              }}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                formState.mediaType === "video"
                  ? "border-[#B5111B] bg-rose-50/50 text-[#B5111B] ring-2 ring-[#B5111B]/20"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  formState.mediaType === "video" ? "bg-[#B5111B] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Film className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black">Video Broadcast</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  YouTube, Vimeo, MP4, or Upload
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                cleanupStagedFile();
                setFormState((prev) => ({
                  ...prev,
                  mediaType: "audio",
                  category: "Audio Podcasts",
                }));
              }}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                formState.mediaType === "audio"
                  ? "border-[#B5111B] bg-rose-50/50 text-[#B5111B] ring-2 ring-[#B5111B]/20"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  formState.mediaType === "audio" ? "bg-[#B5111B] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black">Audio Podcast</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  MP3 File or External Stream
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                cleanupStagedFile();
                setFormState((prev) => ({
                  ...prev,
                  mediaType: "document",
                  category: "Market Reports",
                }));
              }}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer text-center ${
                formState.mediaType === "document"
                  ? "border-[#B5111B] bg-rose-50/50 text-[#B5111B] ring-2 ring-[#B5111B]/20"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  formState.mediaType === "document" ? "bg-[#B5111B] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black">PDF Document</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Downloadable Market Report
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* FOR VIDEO & AUDIO: 2. Title & Editorial Details */}
        {formState.mediaType !== "document" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              2. Title & Editorial Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Media Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.title || ""}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g., Transforming Commercial Real Estate Value with Strategic Vision"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category Tag
                </label>
                <select
                  value={formState.category || ""}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#B5111B]"
                >
                  <option value="" disabled>Select category...</option>
                  {CATEGORY_PRESETS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {formState.category && !CATEGORY_PRESETS.includes(formState.category) && (
                    <option value={formState.category}>{formState.category}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description / Synopsis
                </label>
                <textarea
                  rows={4}
                  value={formState.description || ""}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Key takeaways, topics discussed, or executive summary..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
                />
              </div>
            </div>
          </div>
        )}

        {/* FOR VIDEO: 3. Video Stream Source */}
        {formState.mediaType === "video" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                3. Video Stream Source
              </h2>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(["youtube", "upload", "vimeo", "mp4"] as const).map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => {
                      if (source !== "upload" && stagedMediaFile?.type === "video") {
                        cleanupStagedFile();
                      }
                      setFormState({ ...formState, videoSource: source });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                      formState.videoSource === source
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {source === "youtube" ? "YouTube" : source === "upload" ? "Upload File" : source.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {formState.videoSource === "upload" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upload Video File (Stored in Rose/Media/Video)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                  <input
                    type="file"
                    accept="video/*"
                    id="video-media-upload"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "video")}
                  />
                  <label
                    htmlFor="video-media-upload"
                    className="cursor-pointer flex flex-col items-center gap-2 text-xs text-slate-600 hover:text-[#B5111B]"
                  >
                    {uploadingField === "video" ? (
                      <div className="flex items-center gap-2 text-rose-600 font-bold">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{uploadStatusText || "Uploading video to Cloudinary..."}</span>
                      </div>
                    ) : stagedMediaFile?.type === "video" ? (
                      <div className="flex flex-col items-center gap-1.5 text-amber-800 font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600" />
                          <span>Video Selected (Staged Locally)</span>
                        </div>
                        <span className="truncate max-w-sm text-xs font-semibold text-slate-800">
                          {stagedMediaFile.file.name} ({(stagedMediaFile.file.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                        <span className="text-[10px] text-amber-700 font-normal">
                          Will upload to Rose/Media/Video upon saving form
                        </span>
                        <span className="text-[11px] text-[#B5111B] font-bold hover:underline mt-0.5">
                          Click to choose a different video file
                        </span>
                      </div>
                    ) : formState.sourceUrl ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle className="w-5 h-5" />
                        <span className="truncate max-w-sm">{formState.sourceUrl}</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                          <Upload className="w-5 h-5 text-slate-500" />
                        </div>
                        <span className="font-bold">Choose a video file (.mp4, .mov, .webm)</span>
                        <span className="text-[11px] text-slate-400">
                          Staged locally; uploads to Rose/Media/Video upon saving
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {formState.videoSource === "youtube"
                    ? "YouTube Video or Embed URL"
                    : formState.videoSource === "vimeo"
                    ? "Vimeo Video URL"
                    : "Direct MP4 Stream URL"}
                </label>
                <input
                  type="url"
                  value={formState.sourceUrl || ""}
                  onChange={(e) => setFormState({ ...formState, sourceUrl: e.target.value })}
                  placeholder={
                    formState.videoSource === "youtube"
                      ? "https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      : "https://..."
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Paste YouTube video links directly; our player embeds and syncs with the playlist automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOR AUDIO: 3. Audio Stream or File */}
        {formState.mediaType === "audio" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                3. Audio Stream or File
              </h2>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(["iframe", "upload", "external"] as const).map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => {
                      if (source !== "upload" && stagedMediaFile?.type === "audio") {
                        cleanupStagedFile();
                      }
                      setFormState({ ...formState, audioSource: source });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                      formState.audioSource === source
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {source === "iframe"
                      ? "📻 Podcast Embed (Iframe / URL)"
                      : source === "upload"
                      ? "Upload MP3"
                      : "Direct MP3 Stream"}
                  </button>
                ))}
              </div>
            </div>

            {formState.audioSource === "iframe" ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Podcast Embed Iframe Code or Player URL <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Fireside, SoundCloud, Spotify, Apple Podcasts, Podbean, Libsyn
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formState.sourceUrl || ""}
                    onChange={(e) => setFormState({ ...formState, sourceUrl: e.target.value })}
                    placeholder='Paste &lt;iframe&gt; embed code (e.g. &lt;iframe src="https://fireside.fm/player/v2/..."&gt;&lt;/iframe&gt;) or player embed URL'
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#B5111B]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Paste the complete <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#B5111B] font-bold">&lt;iframe&gt;</code> HTML code or the direct player embed URL.
                  </p>
                </div>

                {/* Live Interactive Preview */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          extractIframeSrc(formState.sourceUrl)
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-300"
                        }`}
                      />
                      Live Interactive Audio Player Preview
                    </span>
                    {extractIframeSrc(formState.sourceUrl) && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready &amp; Interactive
                      </span>
                    )}
                  </div>

                  {extractIframeSrc(formState.sourceUrl) ? (
                    <div className="border border-slate-200 rounded-2xl p-2 bg-slate-50/70 shadow-xs">
                      <iframe
                        src={extractIframeSrc(formState.sourceUrl)}
                        width="100%"
                        height={extractIframeHeight(formState.sourceUrl, 180)}
                        className="w-full rounded-xl border-0 bg-white block shadow-xs"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-2 shadow-2xs">
                        <Mic className="w-5 h-5 text-[#B5111B]" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">No Embed Code or URL Entered Yet</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                        Paste your podcast embed code or player URL above to preview and test the playable audio here before publishing.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : formState.audioSource === "upload" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upload MP3 Audio File (Stored in Rose/Media/Audio)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                  <input
                    type="file"
                    accept="audio/*,.mp3,.m4a,.wav"
                    id="audio-media-upload"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "audio")}
                  />
                  <label
                    htmlFor="audio-media-upload"
                    className="cursor-pointer flex flex-col items-center gap-2 text-xs text-slate-600 hover:text-[#B5111B]"
                  >
                    {uploadingField === "audio" ? (
                      <div className="flex items-center gap-2 text-rose-600 font-bold">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{uploadStatusText || "Uploading audio to Cloudinary..."}</span>
                      </div>
                    ) : stagedMediaFile?.type === "audio" ? (
                      <div className="flex flex-col items-center gap-1.5 text-amber-800 font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600" />
                          <span>Audio Selected (Staged Locally)</span>
                        </div>
                        <span className="truncate max-w-sm text-xs font-semibold text-slate-800">
                          {stagedMediaFile.file.name} ({(stagedMediaFile.file.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                        <span className="text-[10px] text-amber-700 font-normal">
                          Will upload to Rose/Media/Audio upon saving form
                        </span>
                        <span className="text-[11px] text-[#B5111B] font-bold hover:underline mt-0.5">
                          Click to choose a different audio file
                        </span>
                      </div>
                    ) : formState.sourceUrl ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle className="w-5 h-5" />
                        <span className="truncate max-w-sm">{formState.sourceUrl}</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                          <Mic className="w-5 h-5 text-slate-500" />
                        </div>
                        <span className="font-bold">Choose an MP3 or audio file</span>
                        <span className="text-[11px] text-slate-400">
                          Staged locally; uploads to Rose/Media/Audio upon saving
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  External Audio Stream URL (Blubrry / Direct MP3 Link)
                </label>
                <input
                  type="url"
                  value={formState.sourceUrl || ""}
                  onChange={(e) => setFormState({ ...formState, sourceUrl: e.target.value })}
                  placeholder="https://media.blubrry.com/... or direct .mp3 stream link"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
                />
              </div>
            )}
          </div>
        )}

        {/* FOR PDF DOCUMENT: 2. Market Report PDF Document */}
        {formState.mediaType === "document" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#B5111B] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  2. Market Report PDF Document
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Upload a downloadable executive research or market analysis PDF report
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Report Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.title || ""}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g., Charlotte Region Market Momentum Reports Q3 2026"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Report Category
                </label>
                <select
                  value={formState.category === "Market Reports" ? "Market Reports" : (formState.category || "Market Reports")}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#B5111B]"
                >
                  <option value="Market Reports">Market Reports</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Upload PDF File <span className="text-red-500">*</span> (Stored in Rose/Media/PDF)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  id="pdf-media-upload"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "pdf")}
                />
                <label
                  htmlFor="pdf-media-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-xs text-slate-600 hover:text-[#B5111B]"
                >
                  {uploadingField === "pdf" ? (
                    <div className="flex items-center gap-2 text-rose-600 font-bold">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>{uploadStatusText || "Uploading PDF to Cloudinary..."}</span>
                    </div>
                  ) : stagedMediaFile?.type === "pdf" ? (
                    <div className="flex flex-col items-center gap-1.5 text-amber-800 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-amber-600" />
                        <span>PDF Selected (Staged Locally)</span>
                      </div>
                      <span className="text-xs text-slate-800 font-semibold truncate max-w-md">
                        {stagedMediaFile.file.name} ({(stagedMediaFile.file.size / 1024).toFixed(0)} KB)
                      </span>
                      <span className="text-[10px] text-amber-700 font-normal">
                        Will upload to Rose/Media/PDF upon saving form
                      </span>
                      <span className="text-[11px] text-[#B5111B] font-bold hover:underline mt-0.5">
                        Click to choose a different PDF file
                      </span>
                    </div>
                  ) : formState.sourceUrl ? (
                    <div className="flex flex-col items-center gap-2 text-emerald-600 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>PDF Document Linked</span>
                      </div>
                      <span className="text-xs text-slate-500 font-normal truncate max-w-md">
                        {formState.sourceUrl}
                      </span>
                      <span className="text-[11px] text-[#B5111B] font-bold hover:underline mt-1">
                        Click to choose a different PDF file
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className="font-bold">Choose a PDF document file</span>
                      <span className="text-[11px] text-slate-400">
                        Staged locally; uploads to Rose/Media/PDF upon saving
                      </span>
                    </>
                  )}
                </label>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Note: On the public website, clicking this PDF report will open the document directly in a new browser tab.
              </p>
            </div>
          </div>
        )}

        {/* Publication Status & Visibility (Adjusted inside the main form container) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            {formState.mediaType === "document" ? "3. Publication Status & Visibility" : "4. Publication Status & Visibility"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Publishing State
              </label>
              <select
                value={formState.status || "published"}
                onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#B5111B]"
              >
                <option value="published">Published (Live on Public Site)</option>
                <option value="draft">Draft (Hidden in CMS)</option>
              </select>
            </div>

            <div className="sm:pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formState.featured || false}
                  onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                  className="w-4 h-4 text-[#B5111B] rounded border-slate-300 focus:ring-[#B5111B]"
                />
                <span className="text-xs font-bold text-slate-800">
                  {formState.mediaType === "document"
                    ? "Pin as Featured Market Report"
                    : "Pin as Featured Episode"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
