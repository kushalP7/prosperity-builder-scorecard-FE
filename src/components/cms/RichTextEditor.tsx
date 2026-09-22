"use client"

import * as React from "react"
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon, 
  Heading1,
  Heading2,
  Heading3
} from "lucide-react"

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
              // For non-images (p, div, etc.), preserve ONLY text-align
              const textAlignMatch = style.match(/text-align\s*:\s*(center|right|left|justify)/i)
              if (textAlignMatch) {
                el.setAttribute("style", `text-align: ${textAlignMatch[1].toLowerCase()};`)
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

    return clean.replace(/\s*style=(["'])(.*?)\1/gi, (match, quote, styleContent) => {
      const textAlignMatch = styleContent.match(/text-align\s*:\s*(center|right|left|justify)/i)
      if (textAlignMatch) {
        return ` style="text-align: ${textAlignMatch[1].toLowerCase()};"`
      }
      return ""
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

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
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

  return (
    <div className="space-y-2 w-full">
      {label && <label className="block text-xs font-bold text-slate-800">{label}</label>}

      <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-[#B5111B] transition-colors w-full">
        {/* Editor Toolbar */}
        <div className="bg-slate-100/90 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "<h1>")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors text-xs font-black flex items-center gap-1"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "<h2>")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors text-xs font-black flex items-center gap-1"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "<h3>")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors text-xs font-black flex items-center gap-1"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Formatting */}
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("underline")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "<blockquote>")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => executeCommand("justifyLeft")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyCenter")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyRight")}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          className="min-h-[220px] p-4 sm:p-5 focus:outline-none text-slate-800 text-base leading-relaxed font-sans overflow-x-hidden [&_p]:!ml-0 [&_p]:!mr-0 [&_div]:!ml-0 [&_div]:!mr-0 [&_p]:!pl-0 [&_p]:!pr-0 [&_div]:!pl-0 [&_div]:!pr-0 [&_*]:box-border [&_p]:!w-full [&_div]:!w-full [&_p]:!max-w-none [&_div]:!max-w-none [&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 [&_ul]:!pl-6 [&_ol]:!pl-6 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h2]:my-3 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_h3]:my-3 [&_p]:text-slate-800 [&_p]:leading-relaxed [&_p]:my-3 [&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 [&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base [&_blockquote]:my-4 [&_blockquote]:rounded-r-xl [&_ul]:list-disc [&_ol]:list-decimal [&_li]:mb-1"
        />
      </div>
    </div>
  )
}
