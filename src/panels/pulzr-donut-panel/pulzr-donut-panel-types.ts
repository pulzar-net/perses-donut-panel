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
  center?: { series?: string; label?: string; format?: FormatOptions };
  /** The table's columns; the value and its share unless set. */
  columns?: DonutColumn[];
  /** At most this many slices: past it the smallest fold into Other. */
  limit?: number;
}

export type PulzrDonutPanelProps = PanelProps<PulzrDonutPanelOptions, TimeSeriesData>;
