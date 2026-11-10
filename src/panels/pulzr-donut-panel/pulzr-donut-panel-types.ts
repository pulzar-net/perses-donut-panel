import type { FormatOptions } from '@perses-dev/components';
import type { PanelProps } from '@perses-dev/plugin-system';
import type { TimeSeriesData } from '@perses-dev/spec';

/** A column of the table beside the donut, after each slice's swatch and name. */
export interface DonutColumn {
  title: string;
  /** The `<category> · <field>` series' value. */
  field?: string;
  /** The slice's share of the total, a whole percent. */
  share?: boolean;
  /** The value times the `<category> · <times>` series' value: missed times the fine. */
  times?: string;
  /** With `times`, the format of the value alone when the category has no `times` value. */
  fallbackFormat?: FormatOptions;
  /** A time in parts from the value in `format.unit` (seconds, minutes or hours; minutes unless set): `6h 46m`. */
  timeInParts?: boolean;
  format?: FormatOptions;
}

export interface PulzrDonutPanelOptions {
  /** The slices' values: the table's value column and the tooltip. */
  format?: FormatOptions;
  /** The field whose series are the slices when series are named `<category> · <field>`. */
  value?: string;
  /** A display name per category. */
  names?: Record<string, string>;
  /** A color per category, any CSS color; the theme's palette for the rest. */
  colors?: Record<string, string>;
  /** The figure in the middle: the named series' last value, else the total of the slices. */
  center?: { series?: string; label?: string; format?: FormatOptions; fontSize?: number; fontWeight?: number };
  /** The table's columns; the value and its share unless set. */
  columns?: DonutColumn[];
  /** At most this many slices: past it the smallest fold into Other. */
  limit?: number;
  /** `side`: the table beside the donut; `stacked`: the donut on top, the table under it. `side` unless set. */
  layout?: 'side' | 'stacked';
  /** The donut's radii as percentages (62% and 100% unless set), the gap between slices in degrees, its largest diameter in px. */
  size?: { inner?: string; outer?: string; padAngle?: number; max?: number };
}

export type PulzrDonutPanelProps = PanelProps<PulzrDonutPanelOptions, TimeSeriesData>;
