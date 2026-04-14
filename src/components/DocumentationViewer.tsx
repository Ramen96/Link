import ReactMarkdown from 'react-markdown';
import React from 'react';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

interface Props {
  content: string;
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

export default function DocumentationViewer({ content }: Props) {
  return (
    <article className="pb-8 sm:pb-12">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 font-mono text-xl font-medium tracking-tight text-zinc-900 first:mt-0 sm:mb-6 sm:mt-10 sm:text-2xl dark:text-zinc-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-8 border-t border-zinc-100 pt-6 font-mono text-sm font-medium text-zinc-900 sm:mb-4 sm:mt-10 sm:pt-8 sm:text-base dark:border-zinc-800/60 dark:text-zinc-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-xs font-medium uppercase tracking-widest text-zinc-400 sm:mb-3 sm:mt-6 dark:text-zinc-600">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-sm leading-relaxed text-zinc-500 sm:mb-5 sm:text-base dark:text-zinc-400">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition-colors hover:decoration-zinc-600 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:decoration-zinc-400"
            >
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
            // On mobile: flush to viewport edge with -mx bleed for full-width scroll
            // On sm+: normal flow with border and rounded corners
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
        {content}
      </ReactMarkdown>
    </article>
  );
}
