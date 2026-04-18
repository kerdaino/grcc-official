"use client";

import { useState } from "react";

type EventImageViewerProps = {
  src: string;
  alt: string;
  containerClassName?: string;
  imageClassName?: string;
};

export default function EventImageViewer({
  src,
  alt,
  containerClassName = "",
  imageClassName = "w-full h-full object-cover rounded-xl",
}: EventImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`relative block w-full overflow-hidden ${containerClassName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imageClassName} />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/70 p-4 sm:p-6"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="flex min-h-full items-center justify-center overflow-y-auto">
            <div
              className="relative mx-auto w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white hover:bg-black"
              >
                Close
              </button>

              <div className="overflow-auto rounded-2xl bg-white/5 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="mx-auto max-h-[90vh] w-full rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
