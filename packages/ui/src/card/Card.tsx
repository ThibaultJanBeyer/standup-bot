import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import { cn } from "../utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
);

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants(), className)} {...props} />
));
Card.displayName = "Card";

const cardHeaderVariants = cva("flex flex-col space-y-1.5 p-6");

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardHeaderVariants>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(cardHeaderVariants(), className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const cardTitleVariants = cva(
  "text-lg font-semibold leading-none tracking-tight",
);

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> &
    VariantProps<typeof cardTitleVariants>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn(cardTitleVariants(), className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const cardDescriptionVariants = cva("text-sm text-muted-foreground");

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> &
    VariantProps<typeof cardDescriptionVariants>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(cardDescriptionVariants(), className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const cardContentVariants = cva("p-6 pt-0");

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof cardContentVariants>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(cardContentVariants(), className)} {...props} />
));
CardContent.displayName = "CardContent";

const cardFooterVariants = cva("flex items-center p-6 pt-0");

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardFooterVariants>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(cardFooterVariants(), className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
  cardHeaderVariants,
  cardFooterVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardContentVariants,
};
