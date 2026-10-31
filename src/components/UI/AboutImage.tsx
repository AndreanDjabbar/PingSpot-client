"use client";

import Image from "next/image";
import { FaExpand } from "react-icons/fa";
import { useImagePreviewModalStore } from "@/stores/ui.store";

interface AboutImageProps {
    src: string;
    alt: string;
    className?: string;
    imageClassName?: string;
    priority?: boolean;
}

export const AboutImage = ({ src, alt, className = "", imageClassName = "", priority = false }: AboutImageProps) => {
    const openImagePreview = useImagePreviewModalStore((state) => state.openImagePreview);

    return (
        <button
            type="button"
            onClick={() => openImagePreview(src)}
            className={`group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-2xl border border-muted/60 bg-surface/5 text-left shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${className}`}
            aria-label={`Preview ${alt}`}
        >
            <Image
                src={src}
                alt={alt}
                fill
                priority={priority}
                className={`object-contain p-2 sm:p-3 ${imageClassName}`}
                sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <span className="absolute inset-0 bg-surface/0 transition-colors duration-300 group-hover:bg-surface/10" />
            <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
                <FaExpand className="text-xs" />
            </span>
        </button>
    );
};
