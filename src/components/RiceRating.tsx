import type { Locale } from "@/lib/types";

interface Props {
  value: number;
  locale: Locale;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export function RiceRating({ value, locale, onChange, disabled }: Props) {
  const label = locale === "id" ? "Penilaian" : "Rating";
  const score = (n: number) => locale === "id" ? n + " dari 5" : n + " out of 5";
  const grains = [1, 2, 3, 4, 5].map(n => {
    const grain = <span aria-hidden="true" className={'rating-grain' + (n <= value ? ' filled' : '')} />;
    return onChange ? <label key={n} className="rating-choice">
      <input className="sr-only" type="radio" name="rice-rating" checked={value === n}
        aria-label={score(n)} value={n} onChange={() => onChange(n)} />
      {grain}
    </label> : <span key={n}>{grain}</span>;
  });
  if (!onChange) return <div className="rating-summary" role="img" aria-label={label + ', ' + score(value)}>{grains}</div>;
  return <fieldset disabled={disabled}>
    <legend className="mb-1 text-sm font-semibold">{label}</legend>
    <div className="rating-picker">
      {grains}
      <span aria-hidden="true" className="rating-count">{value}/5</span>
    </div>
  </fieldset>;
}
