import ReactMarkdown from 'react-markdown';
import React from 'react';
import remarkGfm from 'remark-gfm';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  content: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractHeadings(content: string): Heading[] {
  const lines = content.split('\n');
  const headings: Heading[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({ id: slugify(text), text, level });
    }
  }
  return headings;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="absolute right-2 top-2 flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-400 opacity-0 transition-all group-hover:opacity-100 hover:border-zinc-300 hover:text-zinc-700 sm:right-3 sm:top-3 sm:px-2.5 sm:py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          Copy
        </>
      )}
    </button>
  );
}

function Sidebar({
  headings,
  activeId,
  search,
  onSearch,
  isOpen,
  onClose,
}: {
  headings: Heading[];
  activeId: string;
  search: string;
  onSearch: (v: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? headings.filter((h) =>
      h.text.toLowerCase().includes(search.toLowerCase())
    )
    : headings;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden dark:bg-black/40"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed top-0 left-0 z-30 h-full w-64 border-r border-zinc-200 bg-zinc-50 transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950',
          'lg:sticky lg:top-8 lg:z-auto lg:h-auto lg:max-h-[calc(100vh-4rem)] lg:w-56 lg:shrink-0 lg:translate-x-0 lg:rounded-xl lg:border lg:bg-white lg:dark:bg-zinc-900',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 lg:p-3">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600"
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-7 pr-3 font-mono text-xs text-zinc-700 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:placeholder-zinc-600 dark:focus:border-zinc-500 dark:focus:bg-zinc-800"
              />
              {search && (
                <button
                  onClick={() => onSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            {filtered.length === 0 && (
              <p className="px-2 py-3 text-xs text-zinc-400 dark:text-zinc-600">
                No results for "{search}"
              </p>
            )}
            <ul className="space-y-0.5">
              {filtered.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => handleClick(h.id)}
                    className={[
                      'w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                      h.level === 1
                        ? 'font-medium'
                        : h.level === 2
                          ? 'pl-4'
                          : 'pl-6',
                      activeId === h.id
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300',
                    ].join(' ')}
                  >
                    {h.level >= 2 && (
                      <span className="mr-1.5 text-zinc-300 dark:text-zinc-700">
                        {h.level === 2 ? '–' : '·'}
                      </span>
                    )}
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

export default function DocumentationViewer({ content }: Props) {
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headings = extractHeadings(content);

  // Highlight search matches in content
  const displayContent = search.trim() ? content : content;

  // Track active heading via IntersectionObserver
  useEffect(() => {
    const ids = headings.map((h) => h.id);
    const observers: IntersectionObserver[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [content]);

  // Filter content to matching sections when searching
  const filteredContent = useCallback(() => {
    if (!search.trim()) return content;
    const lines = content.split('\n');
    const results: string[] = [];
    let inMatch = false;
    let currentSection: string[] = [];

    const flush = () => {
      if (inMatch && currentSection.length > 0) {
        results.push(currentSection.join('\n'));
      }
      currentSection = [];
      inMatch = false;
    };

    for (const line of lines) {
      const isHeading = /^#{1,3}\s/.test(line);
      if (isHeading) {
        flush();
        currentSection = [line];
        inMatch = line.toLowerCase().includes(search.toLowerCase());
      } else {
        if (!inMatch && line.toLowerCase().includes(search.toLowerCase())) {
          inMatch = true;
        }
        currentSection.push(line);
      }
    }
    flush();

    return results.length > 0
      ? results.join('\n\n---\n\n')
      : `*No results for "${search}"*`;
  }, [content, search]);

  const renderedContent = filteredContent();

  const headingWithId = (level: number, children: React.ReactNode) => {
    const text = typeof children === 'string'
      ? children
      : Array.isArray(children)
        ? children.map((c) => (typeof c === 'string' ? c : '')).join('')
        : '';
    const id = slugify(text);

    if (level === 1)
      return (
        <h1
          id={id}
          className="mb-4 mt-8 scroll-mt-6 font-mono text-xl font-medium tracking-tight text-zinc-900 first:mt-0 sm:mb-6 sm:mt-10 sm:text-2xl dark:text-zinc-100"
        >
          {children}
        </h1>
      );
    if (level === 2)
      return (
        <h2
          id={id}
          className="mb-3 mt-8 scroll-mt-6 border-t border-zinc-100 pt-6 font-mono text-sm font-medium text-zinc-900 sm:mb-4 sm:mt-10 sm:pt-8 sm:text-base dark:border-zinc-800/60 dark:text-zinc-100"
        >
          {children}
        </h2>
      );
    return (
      <h3
        id={id}
        className="mb-2 mt-5 scroll-mt-6 text-xs font-medium uppercase tracking-widest text-zinc-400 sm:mb-3 sm:mt-6 dark:text-zinc-600"
      >
        {children}
      </h3>
    );
  };

  return (
    <div className="relative flex gap-8 lg:gap-10">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-10 flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm transition-all hover:border-zinc-300 hover:text-zinc-900 lg:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="15" y1="18" y2="18" /></svg>
        Contents
      </button>

      <Sidebar
        headings={headings}
        activeId={activeId}
        search={search}
        onSearch={setSearch}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <article className="min-w-0 flex-1 pb-8 sm:pb-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => headingWithId(1, children),
            h2: ({ children }) => headingWithId(2, children),
            h3: ({ children }) => headingWithId(3, children),
            p: ({ children }) => (
              <p className="mb-4 text-sm leading-relaxed text-zinc-500 sm:mb-5 sm:text-base dark:text-zinc-400">
                {children}
              </p>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition-colors hover:decoration-zinc-600 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:decoration-zinc-400">
                {children}
              </a>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <code className="block w-full font-mono text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-400">
                    {children}
                  </code>
                );
              }
              return (
                <code className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 font-mono text-xs text-zinc-700 sm:rounded-md sm:px-1.5 sm:text-sm dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300">
                  {children}
                </code>
              );
            },
            pre: ({ children, ...props }) => {
              const code = (props as any)?.node?.children?.[0]?.children?.[0]?.value ?? '';
              return (
                <div className="group relative mb-4 sm:mb-5">
                  <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:rounded-xl sm:p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                    {children}
                  </pre>
                  <CopyButton code={code} />
                </div>
              );
            },
            ul: ({ children }) => (
              <ul className="mb-4 space-y-1.5 pl-3 text-sm text-zinc-500 sm:mb-5 sm:space-y-2 sm:pl-4 sm:text-base dark:text-zinc-400">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-4 list-decimal space-y-1.5 pl-3 text-sm text-zinc-500 sm:mb-5 sm:space-y-2 sm:pl-4 sm:text-base dark:text-zinc-400">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed before:mr-2 before:text-zinc-300 before:content-['–'] dark:before:text-zinc-700">
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="mb-4 border-l-2 border-zinc-200 pl-3 text-sm italic text-zinc-400 sm:mb-5 sm:pl-4 sm:text-base dark:border-zinc-800 dark:text-zinc-500">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="-mx-4 mb-5 overflow-x-auto sm:mx-0 sm:mb-6 sm:rounded-xl sm:border sm:border-zinc-200 dark:sm:border-zinc-800">
                <table className="w-full min-w-120">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 sm:px-4 sm:py-3 dark:text-zinc-600">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-t border-zinc-100 px-3 py-2.5 font-mono text-xs text-zinc-600 sm:px-4 sm:py-3 sm:text-sm dark:border-zinc-800/50 dark:text-zinc-400">
                {children}
              </td>
            ),
            hr: () => (
              <hr className="my-8 border-zinc-100 sm:my-10 dark:border-zinc-800/50" />
            ),
            strong: ({ children }) => (
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                {children}
              </strong>
            ),
          }}
        >
          {renderedContent}
        </ReactMarkdown>
      </article>
    </div>
  );
}
