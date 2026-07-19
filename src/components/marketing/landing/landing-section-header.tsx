import { LANDING_SCROLL_REVEAL } from "@/components/marketing/landing/scroll-reveal-presets";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Text } from "@/components/ui/text";
import { cn } from "@/utils/cn";

type LandingSectionHeaderProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleVariant?: "display" | "headline";
};

/**
 * Shared section intro — dark editorial layout, one ScrollReveal on the title.
 */
export function LandingSectionHeader({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  titleVariant = "headline",
}: LandingSectionHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        centered && "mx-auto items-center text-center",
      )}
    >
      {eyebrow ? (
        <Text as="p" variant="label" className="text-accent">
          {eyebrow}
        </Text>
      ) : null}
      <ScrollReveal
        {...LANDING_SCROLL_REVEAL}
        as="div"
        id={id}
        textAs="h2"
        containerClassName={cn(centered && "scroll-reveal--center")}
        textClassName={
          titleVariant === "display"
            ? "scroll-reveal-text--display"
            : "scroll-reveal-text--headline"
        }
      >
        {title}
      </ScrollReveal>
      {description ? (
        <Text
          as="p"
          variant="body-lg"
          className={cn(
            "max-w-2xl text-ink-secondary",
            centered && "mx-auto text-center",
          )}
        >
          {description}
        </Text>
      ) : null}
    </header>
  );
}
