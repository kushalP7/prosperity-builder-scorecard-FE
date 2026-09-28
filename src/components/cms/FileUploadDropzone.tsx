"use client"

import * as React from "react"
import { Upload, FileText, Image as ImageIcon, X, CheckCircle2, ExternalLink, Link2, RefreshCw } from "lucide-react"
import { createPendingUpload, isPendingUpload, getPendingUpload, revokePendingUpload, formatBytes } from "@/lib/pending-uploads"

interface FileUploadDropzoneProps {
  acceptType?: "image" | "document"
  value?: string
  onChange: (url: string) => void
  label?: string
  helperText?: string
  folder?: string
}

export function FileUploadDropzone({
  acceptType = "image",
  value = "",
  onChange,
  label = "Upload File",
  helperText = "Drag & drop or click to select",
  folder = "reports",
}: FileUploadDropzoneProps) {
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [showManualUrl, setShowManualUrl] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file) return
    setError(null)

    if (acceptType === "image" && !file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP)")
      return
    }

    // Revoke previous blob if it was a pending local preview
    if (isPendingUpload(value)) {
      revokePendingUpload(value)
    }

    // Stage file locally in memory; will upload to Cloudinary upon saving form
    const previewUrl = createPendingUpload(file, folder, acceptType)
    onChange(previewUrl)
  }

  const handleRemove = () => {
    if (isPendingUpload(value)) {
      revokePendingUpload(value)
    }
    onChange("")
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  const isPending = isPendingUpload(value)
  const pendingInfo = isPending ? getPendingUpload(value) : undefined

  const isImage = acceptType === "image" || (value && (value.match(/\.(jpeg|jpg|png|webp|gif|svg)/i) || value.includes("/image/upload/")))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <label className="block text-xs font-bold text-slate-800">{label}</label>}
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] font-bold text-[#B5111B] hover:underline flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          <span>{showManualUrl ? "Upload File" : "Paste URL"}</span>
        </button>
      </div>

      {showManualUrl && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste Cloudinary or direct URL (https://res.cloudinary.com/...)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-[#B5111B]"
          />
        </div>
      )}

      {value ? (
        <div className="border-2 border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 shadow-xs relative group">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{pendingInfo?.name || `File Attached (${folder})`}</span>
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#B5111B] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Replace File"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200 cursor-pointer"
                title="Remove File"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Visual Preview Card */}
          {isImage ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100/80 max-h-60 flex items-center justify-center p-2">
              <img
                src={value}
                alt="File Preview"
                className="w-full h-auto max-h-56 object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#B5111B]/10 text-[#B5111B] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {pendingInfo?.name || "Document Attachment"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono truncate">
                    {pendingInfo?.size ? formatBytes(pendingInfo.size) : value}
                  </span>
                </div>
              </div>

              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#B5111B] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#8F0D15] transition-all shrink-0"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptType === "image" ? "image/*" : ".pdf,.doc,.docx,.mp4,.zip"}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-[#B5111B] bg-red-50/50 scale-[1.01]"
              : "border-slate-300 bg-slate-50/50 hover:border-[#B5111B]/60 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptType === "image" ? "image/*" : ".pdf,.doc,.docx,.mp4,.zip"}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#B5111B] shadow-xs flex items-center justify-center">
              {acceptType === "image" ? <ImageIcon className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800">{helperText}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {acceptType === "image" ? "Supports JPG, PNG, WebP (Uploads to Cloudinary on save)" : "Supports PDF, DOCX, ZIP files (Uploads on save)"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-bold text-red-600 pt-1">{error}</p>}
    </div>
  )
}
