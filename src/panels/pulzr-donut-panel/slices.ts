import type { FormatOptions } from '@perses-dev/components';
import { formatValue } from '@perses-dev/components';
import type { TimeSeries, TimeSeriesData } from '@perses-dev/spec';

import type { DonutColumn, PulzrDonutPanelOptions } from './pulzr-donut-panel-types';

/** What separates a category from its field in a series name: `card · payers`. */
export const SEPARATOR = ' · ';

/** Without a format, a figure in full with its thousands grouped: `1,099`. */
export const PLAIN: FormatOptions = { unit: 'decimal', shortValues: false };

export interface Slice {
  /** The category, as the series names it; `Other` for the folded ones. */
  key: string;
  name: string;
  value: number;
  color: string;
  /** The category's other fields' values, by field. */
  fields: Record<string, number>;
}

export interface Donut {
  /** Largest first, Other last. */
  slices: Slice[];
  total: number;
  /** The figure in the middle; undefined when its series has no value. */
  center?: number;
}

/** A series' last value that is a number. */
function lastValue(series: TimeSeries): number | undefined {
  for (let i = series.values.length - 1; i >= 0; i--) {
    const v = series.values[i]![1];
    if (v !== null && Number.isFinite(v)) return v;
  }
  return undefined;
}

/**
 * The slices from the query results. With `value`, the `<category> · <value>` series are the slices and
 * the category's other `<category> · <field>` series fill its fields; without it every series is a slice
 * named by its whole name. The centre's series is not a slice; series labelled `compare` are left out, and
 * so are slices of nothing. Colors follow the order the query gives the categories, so a category keeps
 * its color as amounts move.
 */
export function donutOf(
  results: Array<{ data?: TimeSeriesData }>,
  spec: PulzrDonutPanelOptions,
  palette: string[],
  otherColor: string,
): Donut {
  const values = new Map<string, number>();
  const fields = new Map<string, Record<string, number>>();
  let center: number | undefined;
  for (const series of results.flatMap((r) => r.data?.series ?? [])) {
    if (series.labels?.compare) continue;
    const v = lastValue(series);
    if (v === undefined) continue;
    if (spec.center?.series !== undefined && series.name === spec.center.series) {
      center = v;
      continue;
    }
    const at = spec.value ? series.name.lastIndexOf(SEPARATOR) : -1;
    if (at < 0) {
      if (!spec.value) values.set(series.name, v);
      continue;
    }
    const category = series.name.slice(0, at);
    const field = series.name.slice(at + SEPARATOR.length);
    if (field === spec.value) values.set(category, v);
    else fields.set(category, { ...fields.get(category), [field]: v });
  }

  let i = 0;
  let slices: Slice[] = [];
  for (const [key, value] of values) {
    if (value <= 0) continue;
    const color = spec.colors?.[key] ?? palette[i++ % Math.max(1, palette.length)] ?? otherColor;
    const own = { ...fields.get(key) };
    // Each `times` column's product, kept as a field so that Other sums the products, not the factors.
    for (const c of spec.columns ?? []) {
      if (c.times === undefined) continue;
      const base = c.field === undefined ? value : own[c.field];
      const by = own[c.times];
      if (base !== undefined && by !== undefined) own[productOf(c)] = base * by;
    }
    slices.push({ key, name: spec.names?.[key] ?? key, value, color, fields: own });
  }
  slices.sort((a, b) => b.value - a.value);

  if (spec.limit && slices.length > spec.limit) {
    const rest = slices.slice(spec.limit - 1);
    const other: Slice = { key: 'Other', name: 'Other', value: 0, color: otherColor, fields: {} };
    for (const s of rest) {
      other.value += s.value;
      for (const [f, v] of Object.entries(s.fields)) other.fields[f] = (other.fields[f] ?? 0) + v;
    }
    slices = [...slices.slice(0, spec.limit - 1), other];
  }

  const total = slices.reduce((n, s) => n + s.value, 0);
  return { slices, total, center: spec.center?.series === undefined ? total : center };
}

/** A slice's share of the total, a whole percent. */
export function share(value: number, total: number): string {
  return `${total > 0 ? Math.round((value / total) * 100) : 0}%`;
}

/** The table's columns: the value and its share unless set. */
export function columnsOf(spec: PulzrDonutPanelOptions): DonutColumn[] {
  return spec.columns ?? [{ title: '' }, { title: '', share: true }];
}

/** Where a `times` column's product is kept among a slice's fields. */
const productOf = (c: DonutColumn): string => `${c.field ?? ''} × ${c.times}`;

const TO_MINUTES: Record<string, number> = { seconds: 1 / 60, minutes: 1, hours: 60 };

/**
 * A time in parts, as people say it: 45m, 6h 46m, 7h, and past two days 2d 3h, the minutes being noise
 * there. From minutes unless the unit is seconds or hours.
 */
export function timeInParts(value: number, unit: string | undefined): string {
  const minutes = Math.round(value * (TO_MINUTES[unit ?? ''] ?? 1));
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  if (h < 48) return minutes % 60 ? `${h}h ${minutes % 60}m` : `${h}h`;
  return h % 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${Math.floor(h / 24)}d`;
}

/**
 * A slice's cell in a column: its share, a field's value, or its value; `–` for a field it lacks. With
 * `times`, that times the `times` field, else the value alone in the fallback format.
 */
export function cell(slice: Slice, total: number, column: DonutColumn, spec: PulzrDonutPanelOptions): string {
  if (column.share) return share(slice.value, total);
  let v = column.field === undefined ? slice.value : slice.fields[column.field];
  let format = column.format ?? (column.field === undefined ? spec.format : undefined) ?? PLAIN;
  if (column.times !== undefined) {
    const product = slice.fields[productOf(column)];
    if (product !== undefined) v = product;
    else format = column.fallbackFormat ?? PLAIN;
  }
  if (v === undefined) return '–';
  return column.timeInParts ? timeInParts(v, format.unit) : formatValue(v, format);
}
