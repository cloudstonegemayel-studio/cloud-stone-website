"use client";

import { useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeInUp, fadeInLeft, fadeInRight, fadeInScale } from "@/lib/animations";
import { cn } from "@/lib/utils";

type AnimationVariant = "fadeInUp" | "fadeInLeft" | "fadeInRight" | "fadeInScale";

const variantMap: Record<AnimationVariant, Variants> = {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  fadeInScale,
};

interface AnimatedSectionProps {
  children:    React.ReactNode;
  variant?:    AnimationVariant;
  delay?:      number;
  className?:  string;
  once?:       boolean;
  margin?:     string;
  as?:         React.ElementType;
}

export function AnimatedSection({
  children,
  variant   = "fadeInUp",
  delay     = 0,
  className,
  once      = true,
  margin    = "-10%",
  as        = "div",
}: AnimatedSectionProps) {
  const prefersReduced = useReducedMotion();
  const variants       = variantMap[variant];

  const MotionComponent = motion.create(as as "div");

  if (prefersReduced) {
    const Tag = as as React.ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionComponent
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      transition={{ delay }}
    >
      {children}
    </MotionComponent>
  );
}
