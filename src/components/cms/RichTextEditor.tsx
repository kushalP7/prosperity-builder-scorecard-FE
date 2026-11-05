"use client"

import * as React from "react"
import {
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextStrikethroughIcon,
  TextSubscriptIcon,
  TextSuperscriptIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
  LinkIcon,
  LinkBreakIcon,
  PaletteIcon,
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
  TextIndentIcon,
  TextOutdentIcon,
  EraserIcon,
  CaretDownIcon,
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

const HIGHLIGHT_COLORS = [
  { label: "None", value: "transparent" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Rose", value: "#fecdd3" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Amber", value: "#fde68a" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Gray", value: "#e2e8f0" },
] as const

const BLOCK_FORMATS = [
  { label: "Normal", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Quote", value: "blockquote" },
] as const

const FONT_SIZES = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "Huge", value: "28px" },
] as const

type ActiveState = {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  subscript: boolean
  superscript: boolean
  ul: boolean
  ol: boolean
  justifyLeft: boolean
  justifyCenter: boolean
  justifyRight: boolean
  justifyFull: boolean
  link: boolean
  block: string
}

const EMPTY_ACTIVE: ActiveState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  subscript: false,
  superscript: false,
  ul: false,
  ol: false,
  justifyLeft: false,
  justifyCenter: false,
  justifyRight: false,
  justifyFull: false,
  link: false,
  block: "p",
}

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  label?: string
  placeholder?: string
}

function ToolbarBtn({
  title,
  active,
  onMouseDown,
  onClick,
  children,
  className = "",
}: {
  title: string
  active?: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-white text-[#B5111B] shadow-sm ring-1 ring-slate-200"
          : "text-slate-700 hover:bg-white hover:text-[#B5111B]"
      } ${className}`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="h-5 w-px bg-slate-300 mx-0.5 shrink-0" aria-hidden />
}

export function RichTextEditor({
  value,
  onChange,
  label = "Report Content (Rich Text Editor)",
  placeholder = "Write or paste formatted report body text here...",
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState<ActiveState>(EMPTY_ACTIVE)
  const [linkOpen, setLinkOpen] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState("https://")
  const [blockOpen, setBlockOpen] = React.useState(false)
  const [sizeOpen, setSizeOpen] = React.useState(false)

  const keepStyleProps = (style: string) => {
    const kept: string[] = []
    const push = (re: RegExp, prop: string) => {
      const m = style.match(re)
      if (m) kept.push(`${prop}: ${m[1].trim()}`)
    }
    push(/text-align\s*:\s*(center|right|left|justify)/i, "text-align")
    push(/(?:^|;)\s*color\s*:\s*([^;]+)/i, "color")
    push(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i, "background-color")
    push(/(?:^|;)\s*font-weight\s*:\s*([^;]+)/i, "font-weight")
    push(/(?:^|;)\s*font-style\s*:\s*([^;]+)/i, "font-style")
    push(/(?:^|;)\s*text-decoration(?:-line)?\s*:\s*([^;]+)/i, "text-decoration")
    push(/(?:^|;)\s*font-size\s*:\s*([^;]+)/i, "font-size")
    push(/(?:^|;)\s*margin-left\s*:\s*([^;]+)/i, "margin-left")
    push(/(?:^|;)\s*padding-left\s*:\s*([^;]+)/i, "padding-left")
    push(/(?:^|;)\s*vertical-align\s*:\s*([^;]+)/i, "vertical-align")
    return kept
  }

  const sanitizeHtmlContent = (html: string) => {
    if (!html) return ""
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
              const allowedStyles: string[] = []
              style.split(";").forEach((pair) => {
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
              const kept = keepStyleProps(style)
              if (kept.length > 0) {
                el.setAttribute("style", `${kept.join("; ")};`)
              } else {
                el.removeAttribute("style")
              }
            }
          }

          if (isImg) {
            const currentStyle = el.getAttribute("style") || ""
            const hasWidthStyle = currentStyle.includes("width")
            const hasWidthAttr = el.hasAttribute("width")
            if (!hasWidthStyle && !hasWidthAttr) {
              el.setAttribute(
                "style",
                `${currentStyle}; max-width: 28px; max-height: 28px; vertical-align: middle; display: inline-block;`.replace(
                  /^;\s*/,
                  "",
                ),
              )
            }
          }
        })

        return doc.body.innerHTML
      } catch {
        /* fallback below */
      }
    }

    return clean.replace(/\s*style=(["'])(.*?)\1/gi, (_match, _quote, styleContent) => {
      const kept = keepStyleProps(styleContent)
      return kept.length ? ` style="${kept.join("; ")};"` : ""
    })
  }

  React.useEffect(() => {
    if (editorRef.current) {
      const sanitized = sanitizeHtmlContent(value || "")
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized
      }
    }
  }, [value])

  const refreshActive = React.useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
      return
    }

    const query = (cmd: string) => {
      try {
        return document.queryCommandState(cmd)
      } catch {
        return false
      }
    }

    let block = "p"
    let node: Node | null = sel.anchorNode
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement
    while (node && node !== editor) {
      const tag = (node as HTMLElement).tagName?.toLowerCase()
      if (tag && ["h1", "h2", "h3", "blockquote", "p", "div"].includes(tag)) {
        block = tag === "div" ? "p" : tag
        break
      }
      node = (node as HTMLElement).parentElement
    }

    let inLink = false
    let linkHref = ""
    node = sel.anchorNode
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement
    while (node && node !== editor) {
      if ((node as HTMLElement).tagName?.toLowerCase() === "a") {
        inLink = true
        linkHref = (node as HTMLAnchorElement).getAttribute("href") || ""
        break
      }
      node = (node as HTMLElement).parentElement
    }

    setActive({
      bold: query("bold"),
      italic: query("italic"),
      underline: query("underline"),
      strike: query("strikeThrough"),
      subscript: query("subscript"),
      superscript: query("superscript"),
      ul: query("insertUnorderedList"),
      ol: query("insertOrderedList"),
      justifyLeft: query("justifyLeft"),
      justifyCenter: query("justifyCenter"),
      justifyRight: query("justifyRight"),
      justifyFull: query("justifyFull"),
      link: inLink,
      block,
    })

    if (inLink && linkHref) {
      setLinkUrl(linkHref)
    }
  }, [])

  React.useEffect(() => {
    const onSel = () => refreshActive()
    document.addEventListener("selectionchange", onSel)
    return () => document.removeEventListener("selectionchange", onSel)
  }, [refreshActive])

  const emitChange = () => {
    const editor = editorRef.current
    if (!editor) return
    onChange(editor.innerHTML)
    refreshActive()
  }

  const preserveSelection = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const executeCommand = (command: string, cmdValue: string | undefined = undefined) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()

    if (
      command === "bold" ||
      command === "italic" ||
      command === "underline" ||
      command === "strikeThrough" ||
      command === "subscript" ||
      command === "superscript"
    ) {
      try {
        document.execCommand("styleWithCSS", false, "false")
      } catch {
        /* older browsers */
      }
    }

    document.execCommand(command, false, cmdValue)
    emitChange()
  }

  const applyInlineStyle = (cssProp: string, cssValue: string) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // No selection: insert a styled span for typing ahead
      const span = `<span style="${cssProp}: ${cssValue};">&#8203;</span>`
      document.execCommand("insertHTML", false, span)
      emitChange()
      return
    }

    try {
      document.execCommand("styleWithCSS", false, "true")
    } catch {
      /* older browsers */
    }

    if (cssProp === "font-size") {
      // fontSize 1–7 is unreliable; wrap selection via temporary font then replace
      document.execCommand("fontSize", false, "7")
      const fonts = editor.querySelectorAll("font[size='7']")
      fonts.forEach((font) => {
        const span = document.createElement("span")
        span.style.fontSize = cssValue
        span.innerHTML = font.innerHTML
        font.parentNode?.replaceChild(span, font)
      })
    } else if (cssProp === "background-color") {
      try {
        document.execCommand("hiliteColor", false, cssValue)
      } catch {
        document.execCommand("backColor", false, cssValue)
      }
    } else if (cssProp === "color") {
      document.execCommand("foreColor", false, cssValue)
    }

    emitChange()
  }

  const applyBlockFormat = (tag: string) => {
    setBlockOpen(false)
    executeCommand("formatBlock", tag === "p" ? "<p>" : `<${tag}>`)
  }

  const applyFontSize = (size: string) => {
    setSizeOpen(false)
    applyInlineStyle("font-size", size)
  }

  const applyTextColor = (color: string) => {
    applyInlineStyle("color", color)
  }

  const applyHighlight = (color: string) => {
    applyInlineStyle("background-color", color)
  }

  const openLinkPopover = () => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    refreshActive()

    const sel = window.getSelection()
    let href = "https://"
    if (sel && sel.anchorNode) {
      let node: Node | null = sel.anchorNode
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
      while (node && node !== editor) {
        if ((node as HTMLElement).tagName?.toLowerCase() === "a") {
          href = (node as HTMLAnchorElement).getAttribute("href") || "https://"
          break
        }
        node = (node as HTMLElement).parentElement
      }
    }
    setLinkUrl(href)
    setLinkOpen(true)
  }

  const applyLink = () => {
    const url = linkUrl.trim()
    if (!url) return
    const editor = editorRef.current
    if (!editor) return
    editor.focus()

    const sel = window.getSelection()
    if (sel && sel.isCollapsed) {
      // Caret in existing link → update href; otherwise insert linked text
      let node: Node | null = sel.anchorNode
      if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement
      let anchor: HTMLAnchorElement | null = null
      while (node && node !== editor) {
        if ((node as HTMLElement).tagName?.toLowerCase() === "a") {
          anchor = node as HTMLAnchorElement
          break
        }
        node = (node as HTMLElement).parentElement
      }
      if (anchor) {
        anchor.setAttribute("href", url)
        emitChange()
      } else {
        document.execCommand("insertHTML", false, `<a href="${url}">${url}</a>`)
        emitChange()
      }
    } else {
      executeCommand("createLink", url)
    }
    setLinkOpen(false)
  }

  const removeLink = () => {
    executeCommand("unlink")
    setLinkOpen(false)
    setLinkUrl("https://")
  }

  const clearFormatting = () => {
    executeCommand("removeFormat")
    // Also flatten block back to paragraph when possible
    try {
      document.execCommand("formatBlock", false, "<p>")
    } catch {
      /* ignore */
    }
    emitChange()
  }

  const handleInput = () => emitChange()

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
        refreshActive()
      }
    }
  }

  const blockLabel = BLOCK_FORMATS.find((b) => b.value === active.block)?.label || "Normal"

  const editorSurfaceClass =
    "min-h-[220px] p-4 sm:p-5 focus:outline-none text-slate-800 text-base leading-relaxed font-sans overflow-x-hidden " +
    "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none " +
    "[&_p]:!ml-0 [&_p]:!mr-0 [&_div]:!ml-0 [&_div]:!mr-0 [&_p]:!pl-0 [&_p]:!pr-0 [&_div]:!pl-0 [&_div]:!pr-0 " +
    "[&_*]:box-border [&_p]:!w-full [&_div]:!w-full [&_p]:!max-w-none [&_div]:!max-w-none " +
    "[&_img]:max-w-[28px] [&_img]:max-h-[28px] [&_img]:inline-block [&_img]:align-middle [&_img]:my-0.5 [&_img]:mx-1 " +
    "[&_ul]:!pl-6 [&_ol]:!pl-6 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline " +
    "[&_s]:line-through [&_strike]:line-through [&_del]:line-through " +
    "[&_sub]:text-[0.75em] [&_sub]:align-sub [&_sup]:text-[0.75em] [&_sup]:align-super " +
    "[&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#B5111B] [&_h1]:tracking-tight [&_h1]:my-4 " +
    "[&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#B5111B] [&_h2]:tracking-tight [&_h2]:my-3 " +
    "[&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:tracking-tight [&_h3]:my-3 " +
    "[&_p]:text-slate-800 [&_p]:leading-relaxed [&_p]:my-3 " +
    "[&_blockquote]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B5111B] [&_blockquote]:bg-red-50/60 " +
    "[&_blockquote]:text-slate-900 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-base " +
    "[&_blockquote]:my-4 [&_blockquote]:rounded-r-xl " +
    "[&_ul]:list-disc [&_ol]:list-decimal [&_li]:mb-1 " +
    "[&_a]:text-[#B5111B] [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-semibold [&_a:hover]:text-[#8F0D15]"

  return (
    <div className="space-y-2 w-full">
      {label && <label className="block text-xs font-bold text-slate-800">{label}</label>}

      <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-[#B5111B] transition-colors w-full">
        {/* Toolbar — Quill-like groups */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-2 py-1.5 flex flex-wrap items-center gap-0.5 relative z-10">
          {/* Undo / Redo */}
          <ToolbarBtn title="Undo" onMouseDown={preserveSelection} onClick={() => executeCommand("undo")}>
            <ArrowCounterClockwiseIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn title="Redo" onMouseDown={preserveSelection} onClick={() => executeCommand("redo")}>
            <ArrowClockwiseIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Block format dropdown */}
          <div className="relative">
            <button
              type="button"
              title="Text style"
              onMouseDown={preserveSelection}
              onClick={() => {
                setBlockOpen((o) => !o)
                setSizeOpen(false)
                setLinkOpen(false)
              }}
              className="h-8 px-2 rounded-md text-xs font-bold text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors flex items-center gap-1 min-w-[7.5rem]"
            >
              <span className="truncate">{blockLabel}</span>
              <CaretDownIcon weight="bold" className="w-3 h-3 shrink-0 opacity-60" />
            </button>
            {blockOpen && (
              <div className="absolute left-0 top-full z-30 mt-1 min-w-[10rem] rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                {BLOCK_FORMATS.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onMouseDown={preserveSelection}
                    onClick={() => applyBlockFormat(b.value)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 ${
                      active.block === b.value ? "text-[#B5111B] font-bold" : "text-slate-700"
                    } ${b.value === "h1" ? "text-lg font-black" : ""} ${b.value === "h2" ? "text-base font-black" : ""} ${
                      b.value === "h3" ? "font-bold" : ""
                    } ${b.value === "blockquote" ? "italic font-serif" : ""}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font size */}
          <div className="relative">
            <button
              type="button"
              title="Font size"
              onMouseDown={preserveSelection}
              onClick={() => {
                setSizeOpen((o) => !o)
                setBlockOpen(false)
                setLinkOpen(false)
              }}
              className="h-8 px-2 rounded-md text-xs font-bold text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors flex items-center gap-1"
            >
              Size
              <CaretDownIcon weight="bold" className="w-3 h-3 shrink-0 opacity-60" />
            </button>
            {sizeOpen && (
              <div className="absolute left-0 top-full z-30 mt-1 min-w-[8rem] rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onMouseDown={preserveSelection}
                    onClick={() => applyFontSize(s.value)}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-[#B5111B]"
                    style={{ fontSize: s.value }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ToolbarDivider />

          {/* Inline marks */}
          <ToolbarBtn title="Bold" active={active.bold} onMouseDown={preserveSelection} onClick={() => executeCommand("bold")}>
            <TextBIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Italic"
            active={active.italic}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("italic")}
          >
            <TextItalicIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Underline"
            active={active.underline}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("underline")}
          >
            <TextUnderlineIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Strikethrough"
            active={active.strike}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("strikeThrough")}
          >
            <TextStrikethroughIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Subscript"
            active={active.subscript}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("subscript")}
          >
            <TextSubscriptIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Superscript"
            active={active.superscript}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("superscript")}
          >
            <TextSuperscriptIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>

          {/* Text color */}
          <div className="relative group/color flex items-center">
            <button
              type="button"
              className="p-1.5 rounded-md text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors flex items-center gap-1"
              title="Text color"
              onMouseDown={preserveSelection}
            >
              <PaletteIcon weight="bold" className="w-4 h-4" />
              <span className="block w-3 h-1 rounded-sm bg-[#B5111B]" aria-hidden />
            </button>
            <div className="absolute left-0 top-full z-30 mt-1 hidden group-hover/color:flex group-focus-within/color:flex flex-col gap-1.5 p-2 rounded-xl border border-slate-200 bg-white shadow-lg min-w-[148px]">
              <p className="text-[10px] font-bold text-slate-500 px-0.5">Text</p>
              <div className="grid grid-cols-4 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onMouseDown={preserveSelection}
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
                  onMouseDown={preserveSelection}
                  onChange={(e) => applyTextColor(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Highlight */}
          <div className="relative group/hl flex items-center">
            <button
              type="button"
              className="p-1.5 rounded-md text-slate-700 hover:bg-white hover:text-[#B5111B] transition-colors"
              title="Highlight"
              onMouseDown={preserveSelection}
            >
              <span className="block w-4 h-4 rounded-sm border border-slate-300 bg-gradient-to-b from-yellow-200 to-yellow-300" />
            </button>
            <div className="absolute left-0 top-full z-30 mt-1 hidden group-hover/hl:flex group-focus-within/hl:flex flex-col gap-1.5 p-2 rounded-xl border border-slate-200 bg-white shadow-lg min-w-[148px]">
              <p className="text-[10px] font-bold text-slate-500 px-0.5">Highlight</p>
              <div className="grid grid-cols-4 gap-1.5">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onMouseDown={preserveSelection}
                    onClick={() => applyHighlight(c.value)}
                    className="w-7 h-7 rounded-md border border-slate-200 shadow-xs hover:scale-105 transition-transform cursor-pointer"
                    style={{
                      backgroundColor: c.value === "transparent" ? "#fff" : c.value,
                      backgroundImage:
                        c.value === "transparent"
                          ? "linear-gradient(45deg,#e2e8f0 25%,transparent 25%,transparent 75%,#e2e8f0 75%),linear-gradient(45deg,#e2e8f0 25%,transparent 25%,transparent 75%,#e2e8f0 75%)"
                          : undefined,
                      backgroundSize: c.value === "transparent" ? "8px 8px" : undefined,
                      backgroundPosition: c.value === "transparent" ? "0 0, 4px 4px" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <ToolbarDivider />

          {/* Lists / indent */}
          <ToolbarBtn
            title="Bullet list"
            active={active.ul}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("insertUnorderedList")}
          >
            <ListBulletsIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Numbered list"
            active={active.ol}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("insertOrderedList")}
          >
            <ListNumbersIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn title="Decrease indent" onMouseDown={preserveSelection} onClick={() => executeCommand("outdent")}>
            <TextOutdentIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn title="Increase indent" onMouseDown={preserveSelection} onClick={() => executeCommand("indent")}>
            <TextIndentIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Quote"
            active={active.block === "blockquote"}
            onMouseDown={preserveSelection}
            onClick={() => applyBlockFormat("blockquote")}
          >
            <QuotesIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Align */}
          <ToolbarBtn
            title="Align left"
            active={active.justifyLeft}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("justifyLeft")}
          >
            <TextAlignLeftIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Align center"
            active={active.justifyCenter}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("justifyCenter")}
          >
            <TextAlignCenterIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Align right"
            active={active.justifyRight}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("justifyRight")}
          >
            <TextAlignRightIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Justify"
            active={active.justifyFull}
            onMouseDown={preserveSelection}
            onClick={() => executeCommand("justifyFull")}
          >
            <TextAlignJustifyIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>

          <ToolbarDivider />

          {/* Link */}
          <div className="relative">
            <ToolbarBtn title="Link" active={active.link || linkOpen} onMouseDown={preserveSelection} onClick={openLinkPopover}>
              <LinkIcon weight="bold" className="w-4 h-4" />
            </ToolbarBtn>
            {linkOpen && (
              <div
                className="absolute left-0 top-full z-30 mt-1 w-72 rounded-xl border border-slate-200 bg-white shadow-lg p-3 space-y-2"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Link URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      applyLink()
                    }
                    if (e.key === "Escape") setLinkOpen(false)
                  }}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#B5111B]"
                  placeholder="https://"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onMouseDown={preserveSelection}
                    onClick={applyLink}
                    className="flex-1 h-8 rounded-lg bg-[#B5111B] text-white text-xs font-bold hover:bg-[#8F0D15] transition-colors"
                  >
                    {active.link ? "Update" : "Apply"}
                  </button>
                  {active.link && (
                    <button
                      type="button"
                      title="Remove link"
                      onMouseDown={preserveSelection}
                      onClick={removeLink}
                      className="h-8 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LinkBreakIcon weight="bold" className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onMouseDown={preserveSelection}
                    onClick={() => setLinkOpen(false)}
                    className="h-8 px-2.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <ToolbarBtn title="Clear formatting" onMouseDown={preserveSelection} onClick={clearFormatting}>
            <EraserIcon weight="bold" className="w-4 h-4" />
          </ToolbarBtn>
        </div>

        {/* Content Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onClick={() => {
            setBlockOpen(false)
            setSizeOpen(false)
          }}
          data-placeholder={placeholder}
          className={editorSurfaceClass}
        />
      </div>
    </div>
  )
}
