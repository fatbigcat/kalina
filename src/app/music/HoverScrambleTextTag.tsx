"use client";
import ScrambleText from "@/components/ScrambleText";
import { useState, ElementType, ComponentPropsWithoutRef } from "react";

type Props<T extends ElementType> = {
  as?: T;
  className?: string;
  text: string;
} & ComponentPropsWithoutRef<T>;

export default function HoverScrambleTextTag<T extends ElementType = "span">({
  as: Tag = "span",
  className,
  text,
  ...rest
}: Props<T>) {
  const [hover, setHover] = useState(false);
  return (
    <Tag
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
    >
      <ScrambleText text={text} active={hover} />
    </Tag>
  );
}