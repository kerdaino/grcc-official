"use client";

import { useEffect, useRef } from "react";

function getTelegramPostPath(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host !== "t.me" && host !== "telegram.me") {
      return "";
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts[0] === "s") {
      parts.shift();
    }

    if (parts.length < 2) {
      return "";
    }

    return `${parts[0]}/${parts[1]}`;
  } catch {
    return "";
  }
}

export default function TelegramPostEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const postPath = getTelegramPostPath(url);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !postPath) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-post", postPath);
    script.setAttribute("data-width", "100%");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-dark", "0");

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [postPath]);

  if (!postPath) {
    return null;
  }

  return <div ref={containerRef} className="min-h-[220px]" />;
}
