"use client"

import * as React from "react"
import {
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  LinkIcon,
  TextHOneIcon,
  TextHTwoIcon,
  TextHThreeIcon,
  PaletteIcon,
} from "@phosphor-icons/react"

const TEXT_COLORS = [
  { label: "Default", value: "#1e293b" },
  { label: "Rose red", value: "#B5111B" },
  { label: "Black", value: "#000000" },
  { label: "Slate", value: "#475569" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Green", value: "#15803d" },
  { label: "Amber", value: "#b45309" },
  { label: "White", value: "#ffffff" },
] as const

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  label?: string
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  label = "Report Content (Rich Text Editor)",
  placeholder = "Write or paste formatted report body text here...",
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)

  const sanitizeHtmlContent = (html: string) => {
    if (!html) return ""
    // Remove class attributes (strips external framework classes like ql-indent-*, ql-align-*, MsoNormal, etc.)
    const clean = html.replace(/\s*class=["'][^"']*["']/gi, "")

    if (typeof window !== "undefined") {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(clean, "text/html")
        const elements = doc.body.querySelectorAll("*")

        elements.forEach((el) => {
          const isImg = el.tagName.toLowerCase() === "img"
          const style = el.getAttribute("style")

          if (style) {
            if (isImg) {
              // For <img> tags, preserve width, height, max-width, max-height, vertical-align, display
              const allowedStyles: string[] = []
              const pairs = style.split(";")
              pairs.forEach((pair) => {
                const parts = pair.split(":")
                if (parts.length === 2) {
                  const prop = parts[0].trim().toLowerCase()
                  const val = parts[1].trim()
                  if (["width", "height", "max-width", "max-height", "vertical-align", "display"].includes(prop)) {
                    allowedStyles.push(`${prop}: ${val}`)
                  }
                }
              })
              if (allowedStyles.length > 0) {
                el.setAttribute("style", allowedStyles.join("; "))
              } else {
                el.removeAttribute("style")
              }
            } else {
              // Keep align, colors, and inline emphasis (bold/italic/underline via CSS)
              const kept: string[] = []
              const textAlignMatch = style.match(/text-align\s*:\s*(center|right|left|justify)/i)
              if (textAlignMatch) {
                kept.push(`text-align: ${textAlignMatch[1].toLowerCase()}`)
              }
              const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)
              if (colorMatch) {
                kept.push(`color: ${colorMatch[1].trim()}`)
              }
              const bgMatch = style.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i)
              if (bgMatch) {
                kept.push(`background-color: ${bgMatch[1].trim()}`)
              }
              const weightMatch = style.match(/(?:^|;)\s*font-weight\s*:\s*([^;]+)/i)
              if (weightMatch) {
                kept.push(`font-weight: ${weightMatch[1].trim()}`)
              }
              const styleMatch = style.match(/(?:^|;)\s*font-style\s*:\s*([^;]+)/i)
              if (styleMatch) {
                kept.push(`font-style: ${styleMatch[1].trim()}`)
              }
              const decoMatch = style.match(/(?:^|;)\s*text-decoration(?:-line)?\s*:\s*([^;]+)/i)
              if (decoMatch) {
                kept.push(`text-decoration: ${decoMatch[1].trim()}`)
              }
              if (kept.length > 0) {
                el.setAttribute("style", `${kept.join("; ")};`)
              } else {
                el.removeAttribute("style")
              }
            }
          }

          // If it's an <img> tag without explicit width/style, ensure icon dimension limits
          if (isImg) {
            const currentStyle = el.getAttribute("style") || ""
            const hasWidthStyle = currentStyle.includes("width")
            const hasWidthAttr = el.hasAttribute("width")
            if (!hasWidthStyle && !hasWidthAttr) {
              el.setAttribute("style", `${currentStyle}; max-width: 28px; max-height: 28px; vertical-align: middle; display: inline-block;`.replace(/^;\s*/, ""))
            }
          }
        })

        return doc.body.innerHTML
      } catch (err) {
        // Fallback below
      }
    }

    return clean.replace(/\s*style=(["'])(.*?)\1/gi, (_match, _quote, styleContent) => {
      const kept: string[] = []
      const textAlignMatch = styleContent.match(/text-align\s*:\s*(center|right|left|justify)/i)
      if (textAlignMatch) kept.push(`text-align: ${textAlignMatch[1].toLowerCase()}`)
      const colorMatch = styleContent.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)
      if (colorMatch) kept.push(`color: ${colorMatch[1].trim()}`)
      const bgMatch = styleContent.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i)
      if (bgMatch) kept.push(`background-color: ${bgMatch[1].trim()}`)
      const weightMatch = styleContent.match(/(?:^|;)\s*font-weight\s*:\s*([^;]+)/i)
      if (weightMatch) kept.push(`font-weight: ${weightMatch[1].trim()}`)
      const styleMatch = styleContent.match(/(?:^|;)\s*font-style\s*:\s*([^;]+)/i)
      if (styleMatch) kept.push(`font-style: ${styleMatch[1].trim()}`)
      const decoMatch = styleContent.match(/(?:^|;)\s*text-decoration(?:-line)?\s*:\s*([^;]+)/i)
      if (decoMatch) kept.push(`text-decoration: ${decoMatch[1].trim()}`)
      return kept.length ? ` style="${kept.join("; ")};"` : ""
    })
  }

  // Synchronize incoming initial value without losing cursor position
  React.useEffect(() => {
    if (editorRef.current) {
      const sanitized = sanitizeHtmlContent(value || "")
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized
      }
    }
  }, [value])

  const executeCommand = (command: string, cmdValue: string | undefined = undefined) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()

    // Prefer <b>/<i>/<u> over CSS spans so sanitizer / sync can't strip emphasis
    if (command === "bold" || command === "italic" || command === "underline") {
      try {
        document.execCommand("styleWithCSS", false, "false")
      } catch {
        /* older browsers */
      }
    }

    document.execCommand(command, false, cmdValue)
    onChange(editor.innerHTML)
  }

  /** Keep selection when clicking toolbar (otherwise bold/etc. apply to nothing). */
  const preserveSelection = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const htmlText = e.clipboardData.getData("text/html")
    if (htmlText) {
      e.preventDefault()
      const cleanedHtml = sanitizeHtmlContent(htmlText)
      document.execCommand("insertHTML", false, cleanedHtml)
      if (editorRef.current) {
        const fullCleaned = sanitizeHtmlContent(editorRef.current.innerHTML)
        editorRef.current.innerHTML = fullCleaned
        onChange(fullCleaned)
      }
    }
  }

  const handleInsertLink = () => {
    const url = prompt("Enter link URL:", "https://")
    if (url) {
      executeCommand("createLink", url)
    }
  }

  const applyTextColor = (color: string) => {
    editorRef.current?.focus()
    // styleWithCSS makes foreColor use <span style="color:…"> which our sanitizer keeps
    try {
      document.execCommand("styleWithCSS", false, "true")
    } catch {
      /* older browsers */
    }
    executeCommand("foreColor", color)
  }

  return (
    <div className="space-y-2 w-full">
      {label && <label className="block text-xs font-bold text-slate-800">{label}</label>}

      <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-[#B5111B] transition-colors w-full">
        {/* Editor Toolbar */}
        <div className="bg-slate-100/90 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("formatBlock", "<h1>")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors text-xs font-black flex items-center gap-1"
            title="Heading 1"
          >
            <TextHOneIcon weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("formatBlock", "<h2>")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors text-xs font-black flex items-center gap-1"
            title="Heading 2"
          >
            <TextHTwoIcon weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("formatBlock", "<h3>")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors text-xs font-black flex items-center gap-1"
            title="Heading 3"
          >
            <TextHThreeIcon weight="bold" className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Formatting */}
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("bold")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Bold"
          >
            <TextBIcon weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("italic")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Italic"
          >
            <TextItalicIcon weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("underline")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Underline"
          >
            <TextUnderlineIcon weight="bold" className="w-4 h-4" />
          </button>

          {/* Text color */}
          <div className="relative group/color flex items-center">
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors flex items-center gap-1"
              title="Text color"
            >
              <PaletteIcon weight="bold" className="w-4 h-4" />
              <span
                className="block w-3 h-1 rounded-sm bg-[#B5111B]"
                aria-hidden
              />
            </button>
            <div className="absolute left-0 top-full z-20 mt-1 hidden group-hover/color:flex group-focus-within/color:flex flex-col gap-1.5 p-2 rounded-xl border border-slate-200 bg-white shadow-lg min-w-[148px]">
              <div className="grid grid-cols-4 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyTextColor(c.value)}
                    className="w-7 h-7 rounded-md border border-slate-200 shadow-xs hover:scale-105 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer pt-0.5">
                <span>Custom</span>
                <input
                  type="color"
                  defaultValue="#B5111B"
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onChange={(e) => applyTextColor(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Bullet List"
          >
            <ListBulletsIcon weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Numbered List"
          >
            <ListNumbersIcon weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("formatBlock", "<blockquote>")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Blockquote"
          >
            <QuotesIcon weight="bold" className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("justifyLeft")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Align Left"
          >
            <TextAlignLeftIcon weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("justifyCenter")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Align Center"
          >
            <TextAlignCenterIcon weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("justifyRight")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Align Right"
          >
            <TextAlignRightIcon weight="bold" className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Link */}
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={handleInsertLink}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Insert Link"
          >
            <LinkIcon weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          className="min-h-[220px] p-4 sm:p-5 focus:outline-none text-slate-800 text-base leading-relaxed font-sans overflow-x-hidden [&_p]:!ml-0 [&_p]:!mr-0 [&_div]:!ml-0 [&_div]:!mr-0 [&_p]:!pl-0 [&_p]:!pr-0 [&_div]:!pl-0 [&_div]:!pr-0 [&_*]:box-border [&_p]:!w-full [&_div]:!w-full [&_p]:!max-w-none [&_div]:!max-w-none [&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 [&_ul]:!pl-6 [&_ol]:!pl-6 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h2]:my-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_h3]:my-3 [&_p]:text-slate-800 [&_p]:leading-relaxed [&_p]:my-3 [&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 [&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base [&_blockquote]:my-4 [&_blockquote]:rounded-r-xl [&_ul]:list-disc [&_ol]:list-decimal [&_li]:mb-1 [&_a]:text-[#B5111B] [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-semibold [&_a:hover]:text-[#8F0D15]"
        />
      </div>
    </div>
  )
}
