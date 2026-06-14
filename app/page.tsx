'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { DragEvent, ChangeEvent } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; text: string }
  | { status: 'error'; message: string }

type SectionType = 'summary' | 'findings' | 'redflags' | 'nextsteps' | 'general'

interface ParsedSection {
  type: SectionType
  label: string
  content: string[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function generateReportId(): string {
  return 'RPT-' + Math.random().toString(36).slice(2, 10).toUpperCase()
}

const SECTION_MATCHERS: Array<{ regex: RegExp; type: SectionType; label: string }> = [
  { regex: /summar|overview|introduction/i,                                     type: 'summary',  label: 'Summary'       },
  { regex: /key.?finding|finding|result|observation|parameter|value|lab.?test/i, type: 'findings', label: 'Key Findings'  },
  { regex: /red.?flag|concern|abnormal|critical|warning|alert|risk/i,            type: 'redflags', label: 'Red Flags'     },
  { regex: /next.?step|recommendation|action|follow.?up|advice|treatment/i,      type: 'nextsteps',label: 'Next Steps'    },
]

function parseAnalysis(raw: string): ParsedSection[] {
  const lines = raw.split('\n')
  const sections: ParsedSection[] = []
  let current: ParsedSection | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const isHeaderLike =
      /^#{1,4}\s/.test(trimmed) ||
      /^\*\*[^*]+\*\*\s*:?\s*$/.test(trimmed) ||
      /^[A-Z][A-Z\s\-]{3,}:?\s*$/.test(trimmed)

    if (isHeaderLike) {
      const clean = trimmed
        .replace(/^#+\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/:$/, '')
        .trim()
      for (const { regex, type, label } of SECTION_MATCHERS) {
        if (regex.test(clean)) {
          current = { type, label, content: [] }
          sections.push(current)
          break
        }
      }
      continue
    }

    if (!current) {
      current = { type: 'summary', label: 'Summary', content: [] }
      sections.push(current)
    }

    const clean = trimmed
      .replace(/^#{1,4}\s*/, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^[*\-•]\s+/, '')
      .trim()
    if (clean) current.content.push(clean)
  }

  const filtered = sections.filter((s) => s.content.length > 0)
  return filtered.length > 0
    ? filtered
    : [{ type: 'general', label: 'Analysis', content: raw.split('\n').filter((l) => l.trim()) }]
}

// ── Section config ────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  summary: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
  findings: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  redflags: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  nextsteps: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  general: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  ),
}

const SECTION_STYLES: Record<
  SectionType,
  { card: string; border: string; iconWrap: string; iconColor: string; tag: string; tagColor: string; divider: string; text: string; bullet?: string }
> = {
  summary: {
    card:      'bg-[#161B22]',
    border:    'border-[#2DD4BF]/25',
    iconWrap:  'bg-[#2DD4BF]/10',
    iconColor: 'text-[#2DD4BF]',
    tag:       'SUMMARY',
    tagColor:  'text-[#2DD4BF]',
    divider:   'bg-[#2DD4BF]/15',
    text:      'text-[#C9D1D9]',
  },
  findings: {
    card:      'bg-[#161B22]',
    border:    'border-[#30363D]',
    iconWrap:  'bg-[#2DD4BF]/10',
    iconColor: 'text-[#2DD4BF]',
    tag:       'KEY FINDINGS',
    tagColor:  'text-[#8B949E]',
    divider:   'bg-[#30363D]',
    text:      'text-[#C9D1D9]',
  },
  redflags: {
    card:      'bg-[#F59E0B]/5',
    border:    'border-[#F59E0B]/35',
    iconWrap:  'bg-[#F59E0B]/15',
    iconColor: 'text-[#F59E0B]',
    tag:       'RED FLAGS',
    tagColor:  'text-[#F59E0B]',
    divider:   'bg-[#F59E0B]/20',
    text:      'text-[#FCD34D]/85',
    bullet:    'text-[#F59E0B]',
  },
  nextsteps: {
    card:      'bg-[#161B22]',
    border:    'border-[#30363D]',
    iconWrap:  'bg-[#2DD4BF]/10',
    iconColor: 'text-[#2DD4BF]',
    tag:       'NEXT STEPS',
    tagColor:  'text-[#8B949E]',
    divider:   'bg-[#30363D]',
    text:      'text-[#C9D1D9]',
  },
  general: {
    card:      'bg-[#161B22]',
    border:    'border-[#2DD4BF]/25',
    iconWrap:  'bg-[#2DD4BF]/10',
    iconColor: 'text-[#2DD4BF]',
    tag:       'ANALYSIS',
    tagColor:  'text-[#2DD4BF]',
    divider:   'bg-[#2DD4BF]/15',
    text:      'text-[#C9D1D9]',
  },
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Home() {
  const [file, setFile]         = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'idle' })
  const inputRef                = useRef<HTMLInputElement>(null)
  const [reportId, setReportId] = useState('')
  const [clock, setClock]       = useState('')

  useEffect(() => {
    setReportId(generateReportId())
    const tick = () =>
      setClock(new Date().toLocaleTimeString('en-GB', { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const systemStatus =
    analysis.status === 'loading' ? 'PROCESSING'
    : analysis.status === 'success' ? 'COMPLETE'
    : analysis.status === 'error'   ? 'ERROR'
    : 'READY'

  const statusDot =
    systemStatus === 'PROCESSING' ? 'bg-[#2DD4BF] animate-ping'
    : systemStatus === 'COMPLETE' ? 'bg-[#2DD4BF]'
    : systemStatus === 'ERROR'    ? 'bg-red-500'
    : 'bg-[#2DD4BF]/50'

  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') {
      setAnalysis({ status: 'error', message: 'Only PDF files are supported. Please upload a valid PDF.' })
      return
    }
    setFile(f)
    setAnalysis({ status: 'idle' })
  }, [])

  const onDragOver  = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true)  }
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false) }
  const onDrop      = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  const reset = () => {
    setFile(null)
    setAnalysis({ status: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  const analyze = async () => {
    if (!file) {
      setAnalysis({ status: 'error', message: 'Please select a PDF file before analyzing.' })
      return
    }
    setAnalysis({ status: 'loading' })
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('https://anaskhan59.app.n8n.cloud/webhook/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`The server returned an error (status ${res.status}). Please try again.`)
      const data = await res.json()
      if (!data.success || typeof data.analysis !== 'string')
        throw new Error('Received an unexpected response from the server.')
      setAnalysis({ status: 'success', text: data.analysis })
    } catch (err) {
      setAnalysis({
        status: 'error',
        message: err instanceof Error ? err.message : 'A network error occurred. Check your connection and try again.',
      })
    }
  }

  const sections = analysis.status === 'success' ? parseAnalysis(analysis.text) : []

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] font-sans">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">

        {/* ── Lab Report Header ── */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#30363D] bg-[#161B22] px-4 py-3 sm:px-5">
          {/* Status */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-70 ${statusDot}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${
                systemStatus === 'ERROR' ? 'bg-red-500' : 'bg-[#2DD4BF]/70'
              }`} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B949E]">
              {systemStatus}
            </span>
          </div>

          {/* Title */}
          <div className="flex-1 text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#E6EDF3]">
              Medical Report Analyzer
            </p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-[#8B949E]/60 mt-0.5">
              Lab Analysis System · v2.0
            </p>
          </div>

          {/* Report meta */}
          <div className="text-right font-mono text-[10px] leading-5 text-[#8B949E]/70">
            <p className="tracking-wider">{reportId || 'RPT-------'}</p>
            <p className="tabular-nums">{clock}</p>
          </div>
        </header>

        {/* ── Upload & Action (hidden after success) ── */}
        {analysis.status !== 'success' && (
          <>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[#8B949E]/50">
              — Specimen Input —
            </p>

            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={[
                'relative cursor-pointer rounded-sm border py-14 px-8 text-center transition-all duration-150',
                isDragging
                  ? 'border-[#2DD4BF]/60 bg-[#2DD4BF]/5'
                  : 'border-[#30363D] bg-[#161B22] hover:border-[#3D444D] hover:bg-[#1C2128]',
              ].join(' ')}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onInputChange}
              />

              {/* Viewfinder corner brackets */}
              {(['tl','tr','bl','br'] as const).map((pos) => (
                <span
                  key={pos}
                  className={[
                    'absolute w-4 h-4 transition-colors duration-150',
                    pos.startsWith('t') ? 'top-2.5' : 'bottom-2.5',
                    pos.endsWith('l')   ? 'left-2.5' : 'right-2.5',
                    pos.startsWith('t') ? 'border-t-[1.5px]' : 'border-b-[1.5px]',
                    pos.endsWith('l')   ? 'border-l-[1.5px]' : 'border-r-[1.5px]',
                    isDragging ? 'border-[#2DD4BF]' : 'border-[#8B949E]/30',
                  ].join(' ')}
                />
              ))}

              {file ? (
                <div className="flex flex-col items-center gap-2.5">
                  <svg className="w-7 h-7 text-[#2DD4BF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div>
                    <p className="font-mono text-sm font-medium text-[#E6EDF3]">{file.name}</p>
                    <p className="font-mono text-[10px] text-[#8B949E] mt-0.5 tracking-wider">
                      {formatFileSize(file.size)}&nbsp;·&nbsp;PDF
                    </p>
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8B949E]/40 mt-1">
                    Click or drag to replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-8 h-8 text-[#8B949E]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <div>
                    <p className="font-mono text-sm text-[#8B949E]">
                      Drop specimen file here
                      <span className="text-[#2DD4BF]"> /</span> click to browse
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8B949E]/40 mt-1.5">
                      PDF format · Max recommended 20 MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze button */}
            <button
              onClick={analyze}
              disabled={!file || analysis.status === 'loading'}
              className="mt-3 w-full rounded-sm border border-[#2DD4BF]/30 bg-[#2DD4BF]/8 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#2DD4BF] transition-all hover:border-[#2DD4BF]/60 hover:bg-[#2DD4BF]/15 disabled:cursor-not-allowed disabled:opacity-25"
            >
              {analysis.status === 'loading' ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Processing specimen…
                </span>
              ) : (
                '→ Analyze Specimen'
              )}
            </button>

            {/* Error */}
            {analysis.status === 'error' && (
              <div className="mt-4 flex items-start gap-3 rounded-sm border border-red-500/25 bg-red-500/5 px-4 py-3.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-red-400 mb-1">
                    System Error
                  </p>
                  <p className="font-sans text-sm text-red-300/80 leading-relaxed">
                    {analysis.message}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Analysis Results ── */}
        {analysis.status === 'success' && (
          <div>
            {/* Output header */}
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8B949E]/50">
                  — Analysis Output —
                </p>
                <p className="font-mono text-[10px] text-[#8B949E]/35 mt-0.5">
                  {sections.length} section{sections.length !== 1 ? 's' : ''} detected
                  {file ? ` · ${file.name}` : ''}
                </p>
              </div>
              <button
                onClick={reset}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B949E]/50 border border-[#30363D] rounded-sm px-3 py-1.5 hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
              >
                ← New Analysis
              </button>
            </div>

            {/* Section cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section, i) => {
                const s = SECTION_STYLES[section.type]
                const isWide =
                  section.type === 'summary' ||
                  section.type === 'general' ||
                  section.type === 'redflags'
                return (
                  <div
                    key={i}
                    className={[
                      'rounded-sm border px-5 py-4 animate-fade-up',
                      s.card,
                      s.border,
                      isWide ? 'md:col-span-2' : '',
                    ].join(' ')}
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    {/* Card header row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-sm ${s.iconWrap} ${s.iconColor}`}>
                        {SECTION_ICONS[section.type]}
                      </span>
                      <span className={`font-mono text-[9px] font-semibold uppercase tracking-[0.22em] ${s.tagColor}`}>
                        {s.tag}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className={`h-px mb-4 ${s.divider}`} />

                    {/* Content paragraphs */}
                    <div className="space-y-2.5">
                      {section.content.map((para, j) => (
                        <p
                          key={j}
                          className={`font-sans text-sm leading-relaxed ${s.text}`}
                        >
                          {section.type === 'redflags' && (
                            <span className={`mr-1.5 ${s.bullet}`}>▸</span>
                          )}
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom reset */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={reset}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B949E]/40 border border-[#30363D]/60 rounded-sm px-6 py-2 hover:text-[#8B949E] hover:border-[#30363D] transition-colors"
              >
                ← Start New Analysis
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
