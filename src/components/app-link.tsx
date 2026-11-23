"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & {
  to: string;
  params?: Record<string, string>;
};

export function Link({ to, params, ...props }: Props) {
  const href = params ? Object.entries(params).reduce((url, [key, value]) => url.replace(`[${key}]`, encodeURIComponent(value)), to) : to;
  return <NextLink href={href} {...props} />;
}
