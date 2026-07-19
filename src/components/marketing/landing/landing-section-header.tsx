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
 * Shared section intro — dark editorial layout.
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
      <Text
        id={id}
        as="h2"
        variant={titleVariant === "display" ? "display" : "h2"}
        className={cn(centered && "text-center")}
      >
        {title}
      </Text>
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
