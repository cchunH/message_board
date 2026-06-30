"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

interface HoverContextType {
  hoveredId: string | null;
  activePathIds: Set<string>;
  onHover: (id: string, ancestors: string[]) => void;
  onLeave: () => void;
}

const HoverContext = createContext<HoverContextType>({
  hoveredId: null,
  activePathIds: new Set(),
  onHover: () => {},
  onLeave: () => {},
});

export function HoverProvider({ children }: { children: React.ReactNode }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rawPath, setRawPath] = useState<string[]>([]);

  const onHover = useCallback((id: string, ancestors: string[]) => {
    setHoveredId(id);
    setRawPath([id, ...ancestors]);
  }, []);

  const onLeave = useCallback(() => {
    setHoveredId(null);
    setRawPath([]);
  }, []);

  const activePathIds = useMemo(() => new Set(rawPath), [rawPath]);

  return (
    <HoverContext.Provider value={{ hoveredId, activePathIds, onHover, onLeave }}>
      {children}
    </HoverContext.Provider>
  );
}

export function useHoverComment() {
  return useContext(HoverContext);
}