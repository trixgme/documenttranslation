export function Header() {
  return (
    <header className="w-full border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-4xl items-center px-6">
        <div className="flex items-center gap-3">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="m5 8 6 6" />
            <path d="m4 14 6-6 2-3" />
            <path d="M2 5h12" />
            <path d="M7 2h1" />
            <path d="m22 22-5-10-5 10" />
            <path d="M14 18h6" />
          </svg>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            DocTranslate
          </h1>
        </div>
      </div>
    </header>
  );
}
