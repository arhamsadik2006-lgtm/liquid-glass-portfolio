import type * as React from "react";

type AnyProps = {
  children?: React.ReactNode;
  key?: React.Key;
  ref?: any;
  [prop: string]: any;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: AnyProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: AnyProps;
    }
  }
}

export {};