"use client";
import ScrambleText from "@/components/ScrambleText";
import { useState, type HTMLAttributes } from "react";

type TagName = "span" | "h1" | "h2" | "h3" | "p" | "div";

type Props = {
  as?: TagName;
  className?: string;
  text: string;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

export default function HoverScrambleTextTag({
  as: Tag = "span",
  className,
  text,
  ...rest
}: Props) {
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