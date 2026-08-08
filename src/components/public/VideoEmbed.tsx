"use client";

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }
  } catch {}
  return null;
}

function getVimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/);
      return match?.[1] ?? null;
    }
  } catch {}
  return null;
}

export function VideoEmbed({ url, label }: { url: string; label?: string }) {
  const ytId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);

  if (ytId) {
    return (
      <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-sm">
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={label ?? "Video de campaña"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-sm">
        <div className="relative aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={label ?? "Video de campaña"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Fallback: external link button
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-sm font-medium text-white/80 transition hover:bg-white/10"
    >
      Ver video externo ↗
    </a>
  );
}
