import "@/styles/starfield.css";

/**
 * Cosmic starfield backdrop — dark-mode only (opacity controlled by CSS
 * via `.dark .starfield-root`).
 * Renders three drifting star layers keyed by the IDs the reference CSS expects.
 */
export function Starfield() {
  return (
    <div className="starfield-root" aria-hidden>
      <div id="stars" />
      <div id="stars2" />
      <div id="stars3" />
    </div>
  );
}