export default function Footer({
  generatedAt,
  disclaimer,
}: {
  generatedAt: string;
  disclaimer: string;
}) {
  const formatted = new Date(generatedAt).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  });

  return (
    <footer className="mt-8 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="rounded border border-[var(--up)] bg-[var(--up-bg)] p-3.5 text-xs leading-relaxed text-[var(--foreground)]">
          {disclaimer}
        </p>
        <div className="mt-5 flex flex-col gap-1 text-xs text-[var(--muted-2)] sm:flex-row sm:justify-between">
          <span className="tnum">마지막 갱신: {formatted} (KST)</span>
          <span>이 페이지의 어떤 내용도 투자 조언이 아닙니다.</span>
        </div>
      </div>
    </footer>
  );
}
