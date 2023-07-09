import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "../utils";

const cardVariants = cva("rounded-md px-5 py-10 text-center", {
  variants: {
    variant: {
      default: "border border-[#4DAAF890] opacity-80",
      outlinePrimary: "border-gradient text-gradient-light",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ variant, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, className }))}
    {...props}
  />
));

FeatureCard.displayName = "FeatureCard";

const cardHeaderVariants = cva("font-headline text-7xl font-extrabold");

const FeatureCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardHeaderVariants>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(cardHeaderVariants(), className)} {...props} />
));
FeatureCardHeader.displayName = "FeatureCardHeader";

const cardContentVariants = cva("");

const FeatureCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof cardContentVariants>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(cardContentVariants(), className)} {...props} />
));
FeatureCardContent.displayName = "FeatureCardContent";

export {
  FeatureCard,
  FeatureCardHeader,
  FeatureCardContent,
  cardVariants,
  cardHeaderVariants,
  cardContentVariants,
};
