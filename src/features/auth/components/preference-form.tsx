import { savePreferencesAction } from "@/features/auth/actions";
import {
  preferenceCountryCodes,
  PREFERENCE_TOPIC_SLUGS,
  SEX_OPTIONS,
  type ReaderPreferences,
  type SexOption,
} from "@/features/auth/preference-options";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export type PreferenceFormProps = {
  locale: Locale;
  initial: ReaderPreferences | null;
  suggestedCountry: string;
  topicLabels: Record<string, string>;
  countryLabels: Record<string, string>;
  sexLabels: Record<SexOption, string>;
  error?: string;
  copy: {
    title: string;
    lead: string;
    firstName: string;
    lastName: string;
    sex: string;
    sexPlaceholder: string;
    age: string;
    ageHint: string;
    topics: string;
    countries: string;
    emailUpdates: string;
    termsAccept: string;
    termsLink: string;
    save: string;
    nameError: string;
    sexError: string;
    ageError: string;
    topicError: string;
    countryError: string;
    termsError: string;
    saveError: string;
  };
};

const CHIP =
  "cursor-pointer rounded-full border border-border px-3 py-1.5 text-small text-ink-secondary has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-accent-foreground";

const FIELD =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-body text-ink outline-none focus:border-border-focus";

export function PreferenceForm({
  locale,
  initial,
  suggestedCountry,
  topicLabels,
  countryLabels,
  sexLabels,
  error,
  copy,
}: PreferenceFormProps) {
  const selectedTopics = new Set(initial?.topicSlugs ?? []);
  const selectedCountries = new Set(initial?.countryCodes ?? []);
  const suggestCountry = selectedCountries.size === 0;

  return (
    <form action={savePreferencesAction} className="mx-auto flex max-w-xl flex-col gap-8">
      <div>
        <h1 className="text-h1 text-balance">{copy.title}</h1>
        <p className="mt-2 text-small text-ink-muted">{copy.lead}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={copy.firstName}
          name="firstName"
          autoComplete="given-name"
          required
          maxLength={80}
          defaultValue={initial?.firstName ?? ""}
        />
        <Input
          label={copy.lastName}
          name="lastName"
          autoComplete="family-name"
          required
          maxLength={80}
          defaultValue={initial?.lastName ?? ""}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-label">{copy.sex}</span>
          <select name="sex" required defaultValue={initial?.sex ?? ""} className={FIELD}>
            <option value="" disabled>
              {copy.sexPlaceholder}
            </option>
            {SEX_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {sexLabels[option]}
              </option>
            ))}
          </select>
        </label>
        <Input
          label={copy.age}
          name="age"
          type="number"
          inputMode="numeric"
          min={16}
          max={120}
          required
          hint={copy.ageHint}
          defaultValue={initial?.age ?? ""}
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-small font-medium text-ink">{copy.topics}</legend>
        <div className="flex flex-wrap gap-2">
          {PREFERENCE_TOPIC_SLUGS.map((slug) => (
            <label key={slug} className={CHIP}>
              <input
                type="checkbox"
                name="topic"
                value={slug}
                defaultChecked={selectedTopics.has(slug)}
                className="sr-only"
              />
              {topicLabels[slug] ?? slug}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-small font-medium text-ink">{copy.countries}</legend>
        <div className="flex flex-wrap gap-2">
          {preferenceCountryCodes().map((code) => (
            <label key={code} className={CHIP}>
              <input
                type="checkbox"
                name="country"
                value={code}
                defaultChecked={selectedCountries.has(code) || (suggestCountry && code === suggestedCountry)}
                className="sr-only"
              />
              {countryLabels[code] ?? code}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 text-small text-ink">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            name="emailUpdates"
            value="yes"
            defaultChecked={initial?.emailUpdates ?? false}
            className="mt-0.5"
          />
          <span>{copy.emailUpdates}</span>
        </label>
        <p className="flex flex-wrap items-center gap-x-1">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="terms"
              value="yes"
              required
              defaultChecked={Boolean(initial?.termsAcceptedAt)}
            />
            <span>{copy.termsAccept}</span>
          </label>
          <Link href="/terminos" className="veraz-focus-ring underline underline-offset-2">
            {copy.termsLink}
          </Link>
        </p>
      </div>

      <input type="hidden" name="locale" value={locale} />
      {error === "name" ? <p className="text-small text-danger">{copy.nameError}</p> : null}
      {error === "sex" ? <p className="text-small text-danger">{copy.sexError}</p> : null}
      {error === "age" ? <p className="text-small text-danger">{copy.ageError}</p> : null}
      {error === "topic" ? <p className="text-small text-danger">{copy.topicError}</p> : null}
      {error === "country" ? <p className="text-small text-danger">{copy.countryError}</p> : null}
      {error === "terms" ? <p className="text-small text-danger">{copy.termsError}</p> : null}
      {error === "save_failed" || error === "unauthorized" ? (
        <p className="text-small text-danger">{copy.saveError}</p>
      ) : null}
      <button
        type="submit"
        className="veraz-focus-ring h-10 w-fit rounded-md bg-accent px-4 text-small text-accent-foreground"
      >
        {copy.save}
      </button>
    </form>
  );
}
