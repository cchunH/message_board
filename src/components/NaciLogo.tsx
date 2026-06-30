import * as React from "react";

export interface NaciLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * NACi (纳磁科技) brand mark — hand-redrawn geometric SVG.
 * fill = currentColor → inherits the parent text color (monochrome adaptive).
 */
export const NaciLogo = React.forwardRef<SVGSVGElement, NaciLogoProps>(
  function NaciLogo({ className, ...props }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 260 100"
        className={className}
        aria-label="NACi"
        {...props}
      >
        {/* N */}
        <path
          d="M 20,80 L 20,26 A 6,6 0 0,1 32,26 L 32,42 L 68,74 L 68,20 L 80,20 L 80,74 A 6,6 0 0,1 68,74 L 68,58 L 32,26 Z"
          fill="currentColor"
        />
        {/* A */}
        <path
          d="M 95,74 L 114,26 A 6,6 0 0,1 126,26 L 145,74 A 6,6 0 0,1 133,74 L 120,42 L 107,74 A 6,6 0 0,1 95,74 Z"
          fill="currentColor"
        />
        <circle cx="120" cy="62" r="5" fill="currentColor" />
        {/* C */}
        <path
          d="M 206,20 A 6,6 0 0,1 206,32 L 172,32 L 172,38 A 12,12 0 0,1 172,62 L 172,68 L 206,68 A 6,6 0 0,1 206,80 L 160,80 L 160,62 A 12,12 0 0,0 160,38 L 160,20 Z"
          fill="currentColor"
        />
        {/* i */}
        <rect x="227" y="44" width="12" height="36" rx="6" fill="currentColor" />
        <circle cx="233" cy="26" r="6" fill="currentColor" />
      </svg>
    );
  }
);