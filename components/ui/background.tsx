"use client";

import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/magicui/dot-pattern";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <DotPattern
        className={cn(
          "h-full w-full",
          // Light mode
          "[mask-image:radial-gradient(2400px_circle_at_center,transparent,white)]",
          // Dark mode (gradient ke #0f172a atau warna lain)
          "dark:[mask-image:radial-gradient(2400px_circle_at_center,transparent,#0f172a)]"
        )}
      />
    </div>
  );
}
