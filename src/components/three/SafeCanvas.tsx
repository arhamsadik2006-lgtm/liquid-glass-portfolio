"use client";

import React, { type ReactNode, type RefObject } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface SafeCanvasProps extends Omit<CanvasProps, "children"> {
  children: ReactNode;
  fallback: ReactNode;
  activeRef: RefObject<boolean>;
}

export function SafeCanvas({
  children,
  fallback,
  activeRef,
  ...props
}: SafeCanvasProps) {
  return (
    <ErrorBoundary label="webgl" fallback={fallback}>
      {/* 
        By removing frameloop="never" and the manual TickerSync, 
        React Three Fiber will automatically handle its own rendering loop. 
        This prevents the 3D engine from freezing.
      */}
      <Canvas {...props}>
        {children}
      </Canvas>
    </ErrorBoundary>
  );
}