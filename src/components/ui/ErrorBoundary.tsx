"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

export interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;

  public state: ErrorBoundaryState = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[ErrorBoundary:${this.props.label ?? "section"}]`, error, info.componentStack);
  }

  public reset = (): void => {
    this.setState({ error: null });
  };

  public render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="glass glass-dark mx-auto my-10 max-w-md rounded-3xl p-6 text-center text-white">
          <p className="text-sm text-white/70">This section hit a rendering snag.</p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}