"use client"

import * as React from "react"
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  FileText, 
  Image as ImageIcon, 
  FileCheck, 
  BarChart2, 
  Download, 
  Layout, 
  Copy,
  Columns
} from "lucide-react"
import { ReportSectionBlock, ImageTextItem } from "@/lib/reports-api"
import { getPendingUpload, revokePendingUpload } from "@/lib/pending-uploads"
import { RichTextEditor } from "./RichTextEditor"
import { FileUploadDropzone } from "./FileUploadDropzone"

interface ReportBlockBuilderProps {
  blocks: ReportSectionBlock[]
  onChange: (blocks: ReportSectionBlock[]) => void
}

export function ReportBlockBuilder({ blocks, onChange }: ReportBlockBuilderProps) {
  const addBlock = (type: ReportSectionBlock["type"]) => {
    const newBlock: ReportSectionBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title: type === "rich_text" ? "Key Takeaways & Analysis" : type === "image_text" ? "NEWS AND EVENTS" : type === "stats_grid" ? "Key Performance Indicators" : "",
      contentHtml: "",
      imageUrl: type === "image_text" ? "" : undefined,
      imagePosition: type === "image_text" ? "left" : undefined,
      layoutStyle: type === "image_text" ? "wrap" : undefined,
      items: type === "image_text" ? [
        { id: `item-${Date.now()}-1`, imageUrl: "", contentHtml: "", imagePosition: "left", layoutStyle: "wrap" }
      ] : undefined,
      bottomContentHtml: type === "image_text" ? "" : undefined,
      stats: type === "stats_grid" ? [
        { label: "Market Growth", value: "+14.2%" },
        { label: "Active Listings", value: "1,240" },
        { label: "Cap Rate Avg", value: "6.8%" },
      ] : undefined,
      images: type === "gallery" ? [] : undefined,
      pdfUrl: type === "pdf_viewer" ? "" : undefined,
      files: type === "downloads" ? [] : undefined,
    }
    onChange([...blocks, newBlock])
  }

  const updateBlock = (id: string, updates: Partial<ReportSectionBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const removeBlock = (id: string) => {
    const target = blocks.find((b) => b.id === id)
    if (target) {
      if (target.imageUrl) revokePendingUpload(target.imageUrl)
      if (target.pdfUrl) revokePendingUpload(target.pdfUrl)
      target.images?.forEach((img) => img.url && revokePendingUpload(img.url))
      target.files?.forEach((f) => f.url && revokePendingUpload(f.url))
      target.items?.forEach((it) => it.imageUrl && revokePendingUpload(it.imageUrl))
    }
    onChange(blocks.filter((b) => b.id !== id))
  }

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= blocks.length) return
    const updated = [...blocks]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    onChange(updated)
  }

  const duplicateBlock = (block: ReportSectionBlock) => {
    const copy: ReportSectionBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    }
    onChange([...blocks, copy])
  }

  return (
    <div className="space-y-6">
      {/* Static Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-black text-slate-900">
            Dynamic Section Blocks ({blocks.length})
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Add, reorder, or edit custom dynamic blocks for this report.
          </p>
        </div>

        {/* Top Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => addBlock("rich_text")}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
          >
            <FileText className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
            <span>Rich Text</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock("image_text")}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
          >
            <Columns className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
            <span>Image & Text</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock("stats_grid")}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
            <span>Key Stats</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock("gallery")}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
            <span>Gallery</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock("pdf_viewer")}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
            <span>PDF Viewer</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock("downloads")}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
          >
            <Download className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
            <span>Download Files</span>
          </button>
        </div>
      </div>

      {/* Render Block List */}
      {blocks.length === 0 ? (
        <div className="p-12 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 mx-auto flex items-center justify-center border border-slate-200 shadow-2xs">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">No Section Blocks Added Yet</h4>
            <p className="text-[11px] text-slate-500 font-medium max-w-sm mx-auto mt-1">
              Add rich-text articles, side-by-side images, downloadable documents, and KPI grids.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="border-2 border-slate-200 rounded-3xl p-5 bg-white shadow-xs space-y-4 relative group"
            >
              {/* Block Header & Reorder Tools */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 bg-slate-50 -mx-5 -mt-5 p-4 rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#B5111B] text-white flex items-center justify-center text-xs font-black">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold capitalize text-slate-800">
                    {block.type.replace("_", " ")} Block
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveBlock(index, "up")}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === blocks.length - 1}
                    onClick={() => moveBlock(index, "down")}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateBlock(block)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
                    title="Duplicate Block"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg ml-1"
                    title="Remove Block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Block Inputs Based on Type */}
              <div className="space-y-4 pt-1">
                {/* Title Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section Title (Optional)</label>
                  <input
                    type="text"
                    value={block.title || ""}
                    onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                    placeholder="e.g. FLASHBACK MOMENT! / SITE SELECTION & ADVISORY"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#B5111B]"
                  />
                </div>

                {/* 1. RICH TEXT BLOCK */}
                {block.type === "rich_text" && (
                  <RichTextEditor
                    value={block.contentHtml || ""}
                    onChange={(html) => updateBlock(block.id, { contentHtml: html })}
                  />
                )}

                {/* 2. IMAGE + TEXT BLOCK (SIDE-BY-SIDE MULTI-ITEM) */}
                {block.type === "image_text" && (() => {
                  const items: ImageTextItem[] = (block.items && block.items.length > 0)
                    ? block.items
                    : [
                        {
                          id: `item-${Date.now()}-1`,
                          imageUrl: block.imageUrl || "",
                          contentHtml: block.contentHtml || "",
                          imagePosition: block.imagePosition || "left"
                        }
                      ];

                  const updateItems = (newItems: ImageTextItem[]) => {
                    updateBlock(block.id, {
                      items: newItems,
                      imageUrl: newItems[0]?.imageUrl || "",
                      contentHtml: newItems[0]?.contentHtml || "",
                      imagePosition: newItems[0]?.imagePosition || "left",
                      layoutStyle: newItems[0]?.layoutStyle || "wrap",
                    });
                  };

                  const addItem = () => {
                    const newItem: ImageTextItem = {
                      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                      imageUrl: "",
                      contentHtml: "",
                      imagePosition: "left",
                      layoutStyle: "wrap",
                    };
                    updateItems([...items, newItem]);
                  };

                  const removeItem = (idx: number) => {
                    if (items.length <= 1) return;
                    if (items[idx]?.imageUrl) revokePendingUpload(items[idx].imageUrl);
                    updateItems(items.filter((_, i) => i !== idx));
                  };

                  const updateItem = (idx: number, updates: Partial<ImageTextItem>) => {
                    const updated = items.map((it, i) => i === idx ? { ...it, ...updates } : it);
                    updateItems(updated);
                  };

                  return (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {items.map((item, idx) => (
                          <div key={item.id || idx} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-4 relative">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-[#B5111B] text-white flex items-center justify-center text-[10px]">
                                  {idx + 1}
                                </span>
                                Image & Text Item #{idx + 1}
                              </span>

                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {/* Layout Style */}
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                                  <span className="text-slate-500">Layout:</span>
                                  <select
                                    value={item.layoutStyle || "wrap"}
                                    onChange={(e) => updateItem(idx, { layoutStyle: e.target.value as any })}
                                    className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                                  >
                                    <option value="wrap">📰 Text Wrap (Magazine)</option>
                                    <option value="columns">⚖️ 2-Columns (Sticky)</option>
                                    <option value="stacked">📄 Stacked (Banner)</option>
                                  </select>
                                </div>

                                {/* Image Position */}
                                {item.layoutStyle !== "stacked" && (
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                                    <span className="text-slate-500">Image:</span>
                                    <label className="inline-flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`img-pos-${block.id}-${idx}`}
                                        value="left"
                                        checked={item.imagePosition !== "right"}
                                        onChange={() => updateItem(idx, { imagePosition: "left" })}
                                        className="text-[#B5111B]"
                                      />
                                      <span>Left</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`img-pos-${block.id}-${idx}`}
                                        value="right"
                                        checked={item.imagePosition === "right"}
                                        onChange={() => updateItem(idx, { imagePosition: "right" })}
                                        className="text-[#B5111B]"
                                      />
                                      <span>Right</span>
                                    </label>
                                  </div>
                                )}

                                {items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeItem(idx)}
                                    className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-100/60 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className={item.imagePosition === "right" && item.layoutStyle !== "stacked" ? "md:order-2" : "md:order-1"}>
                                <FileUploadDropzone
                                  acceptType="image"
                                  value={item.imageUrl || ""}
                                  onChange={(url) => updateItem(idx, { imageUrl: url })}
                                  label={`Item #${idx + 1} Image`}
                                  helperText="Upload image for side-by-side display"
                                  folder="reports"
                                />
                              </div>

                              <div className={`space-y-2 ${item.imagePosition === "right" && item.layoutStyle !== "stacked" ? "md:order-1" : "md:order-2"}`}>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                  Item #{idx + 1} Title & Content
                                </label>
                                <RichTextEditor
                                  value={item.contentHtml || ""}
                                  onChange={(html) => updateItem(idx, { contentHtml: html })}
                                  label=""
                                  placeholder="Write item title, description, or article content..."
                                />
                                {(() => {
                                  const plainText = (item.contentHtml || "").replace(/<[^>]*>/g, "").trim();
                                  if (plainText.length > 350 && item.layoutStyle === "columns") {
                                    return (
                                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-2 mt-2">
                                        <span className="text-sm">💡</span>
                                        <span>
                                          <strong>Long text detected ({plainText.length} chars):</strong> Switch Layout above to <strong>&ldquo;Text Wrap (Magazine)&rdquo;</strong> to allow text to smoothly flow below the image without empty space.
                                        </span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addItem}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-[#B5111B]/40 hover:border-[#B5111B] bg-red-50/40 hover:bg-red-50 text-[#B5111B] text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Another Side-by-Side Item (e.g. 2nd Image & Text)</span>
                      </button>

                      <div className="pt-4 border-t border-slate-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Bottom Content (Below Images Section)
                        </label>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Optional content to render across the full width below all side-by-side images (e.g. &ldquo;We have teamed up with award winning Lancer Films...&rdquo;)
                        </p>
                        <RichTextEditor
                          value={block.bottomContentHtml || ""}
                          onChange={(html) => updateBlock(block.id, { bottomContentHtml: html })}
                          label=""
                          placeholder="Write summary text, paragraph, or quote that appears below the side-by-side images..."
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 3. STATS GRID BLOCK */}
                {block.type === "stats_grid" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Metric Cards</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(block.stats || []).map((st, i) => (
                        <div key={i} className="p-3 border border-slate-200 rounded-2xl bg-slate-50 space-y-2 relative">
                          <input
                            type="text"
                            value={st.label}
                            onChange={(e) => {
                              const stats = [...(block.stats || [])]
                              stats[i].label = e.target.value
                              updateBlock(block.id, { stats })
                            }}
                            placeholder="Stat Label"
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                          />
                          <input
                            type="text"
                            value={st.value}
                            onChange={(e) => {
                              const stats = [...(block.stats || [])]
                              stats[i].value = e.target.value
                              updateBlock(block.id, { stats })
                            }}
                            placeholder="Stat Value (e.g. $4.2M)"
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-black text-[#B5111B]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const stats = (block.stats || []).filter((_, idx) => idx !== i)
                              updateBlock(block.id, { stats })
                            }}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Remove Card
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const stats = [...(block.stats || []), { label: "New Metric", value: "100" }]
                        updateBlock(block.id, { stats })
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-extrabold hover:bg-slate-200"
                    >
                      Add Stat Card
                    </button>
                  </div>
                )}

                {/* 4. PDF VIEWER BLOCK */}
                {block.type === "pdf_viewer" && (
                  <FileUploadDropzone
                    acceptType="document"
                    value={block.pdfUrl || ""}
                    onChange={(url) => updateBlock(block.id, { pdfUrl: url })}
                    label="PDF Document Attachment"
                    helperText="Upload PDF report to render in-line viewer"
                  />
                )}

                {/* 5. GALLERY BLOCK */}
                {block.type === "gallery" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Add Image to Gallery</label>
                    <FileUploadDropzone
                      acceptType="image"
                      onChange={(url) => {
                        const images = [...(block.images || []), { url, caption: "" }]
                        updateBlock(block.id, { images })
                      }}
                      label=""
                      helperText="Upload image for gallery grid"
                    />

                    {block.images && block.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {block.images.map((img, i) => (
                          <div key={i} className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                            <img src={img.url} alt="Gallery" className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                if (img.url) revokePendingUpload(img.url)
                                const images = block.images?.filter((_, idx) => idx !== i)
                                updateBlock(block.id, { images })
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. DOWNLOADS BLOCK */}
                {block.type === "downloads" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Attached Resource Files</label>
                    <FileUploadDropzone
                      acceptType="document"
                      onChange={(url) => {
                        const pending = getPendingUpload(url)
                        const defaultName = pending?.name ? pending.name.replace(/\.[^/.]+$/, "") : "Resource Document"
                        const files = [...(block.files || []), { name: defaultName, url }]
                        updateBlock(block.id, { files })
                      }}
                      label=""
                      helperText="Upload resource file attachment"
                    />

                    {(block.files || []).map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border border-slate-200 rounded-xl bg-slate-50">
                        <input
                          type="text"
                          value={f.name}
                          onChange={(e) => {
                            const files = [...(block.files || [])]
                            files[i].name = e.target.value
                            updateBlock(block.id, { files })
                          }}
                          className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (f.url) revokePendingUpload(f.url)
                            const files = block.files?.filter((_, idx) => idx !== i)
                            updateBlock(block.id, { files })
                          }}
                          className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Add Block Card (Always positioned below section blocks) */}
      <div className="p-5 sm:p-6 rounded-3xl border-2 border-dashed border-[#B5111B]/30 bg-red-50/20 space-y-4 text-center sm:text-left shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[#B5111B] flex items-center justify-center sm:justify-start gap-1.5">
                <span>Add Another Section Block</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Choose a section type to insert at the bottom of your report layout:
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
              <button
                type="button"
                onClick={() => addBlock("rich_text")}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
              >
                <FileText className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
                <span>Rich Text</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("image_text")}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
              >
                <Columns className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
                <span>Image & Text</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("stats_grid")}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
                <span>Stats Grid</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("pdf_viewer")}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
                <span>PDF Viewer</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("gallery")}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
                <span>Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("downloads")}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#B5111B] hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs border border-slate-200 group"
              >
                <Download className="w-3.5 h-3.5 text-[#B5111B] group-hover:!text-white transition-colors" />
                <span>Downloads</span>
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}
