import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import { EChart, formatValue, useChartsTheme } from '@perses-dev/components';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import type { EChartsCoreOption } from 'echarts/core';
import { use as registerECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { DonutColumn, PulzrDonutPanelProps } from './pulzr-donut-panel-types';
import { PLAIN, cell, columnsOf, donutOf, share } from './slices';

registerECharts([PieChart, TooltipComponent, CanvasRenderer]);

/** Narrower than this, the table goes under the donut. */
const NARROW = 300;

const keyOf = (c: DonutColumn): string => `${c.title}:${c.field ?? (c.share ? '%' : '')}:${c.times ?? ''}`;

/** Shares of a whole: a donut with a figure in the middle, and a table of its slices beside it. */
export function PulzrDonutPanelComponent({
  queryResults,
  spec,
  contentDimensions,
}: PulzrDonutPanelProps): ReactElement {
  const theme = useTheme();
  const chartsTheme = useChartsTheme();
  const muted = alpha(theme.palette.text.secondary, 0.7);
  const donut = useMemo(() => {
    const colors = chartsTheme.echartsTheme.color;
    const palette = Array.isArray(colors) ? colors.filter((c): c is string => typeof c === 'string') : [];
    return donutOf(queryResults, spec, palette, theme.palette.grey[500]);
  }, [queryResults, spec, chartsTheme, theme]);
  const { slices, total } = donut;

  const option = useMemo<EChartsCoreOption>(
    () => ({
      tooltip: {
        trigger: 'item',
        valueFormatter: (v: number): string => `${formatValue(v, spec.format ?? PLAIN)} · ${share(v, total)}`,
      },
      series: [
        {
          type: 'pie',
          // As the dashboard's donuts draw: from three o'clock, anticlockwise, a gap and a card-colored edge between slices.
          radius: [spec.size?.inner ?? '62%', spec.size?.outer ?? '100%'],
          startAngle: 0,
          clockwise: false,
          padAngle: slices.length > 1 ? (spec.size?.padAngle ?? 1.5) : 0,
          itemStyle: { borderColor: theme.palette.background.default, borderWidth: spec.size?.edge ?? 2 },
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: false },
          animation: false,
          data: slices.map((s) => ({ name: s.name, value: s.value, itemStyle: { color: s.color } })),
        },
      ],
    }),
    [slices, total, spec.format, spec.size, theme],
  );

  if (slices.length === 0) {
    return (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <Typography color="text.secondary">No data</Typography>
      </Stack>
    );
  }

  const width = contentDimensions?.width ?? 400;
  const height = contentDimensions?.height ?? 180;
  const stacked = spec.layout === 'stacked';
  const narrow = width < NARROW;
  const max = spec.size?.max ?? Infinity;
  // Square. Stacked, its largest size (140px unless set) within the width; beside the table, as large as the
  // panel's height allows in its column: at least 110px and 38% of the width.
  let size: number;
  if (stacked) size = Math.min(width, spec.size?.max ?? 140);
  else if (narrow) size = Math.min(width, 140, max);
  else size = Math.min(height, Math.max(110, width * 0.38), max);
  size = Math.floor(size);
  const under = stacked || narrow;
  // Stacked, the donut keeps to the left, as the dashboard's kinds card draws it; narrow, it is centred.
  let justifyItems: string | undefined;
  if (stacked) justifyItems = 'start';
  else if (narrow) justifyItems = 'center';
  const columns = columnsOf(spec);
  const dividers = spec.dividers !== false;
  const centerFormat = spec.center?.format ?? spec.format ?? PLAIN;
  const head = { fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: muted };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: under ? 'minmax(0, 1fr)' : `${size}px minmax(0, 1fr)`,
        justifyItems,
        alignItems: 'center',
        gap: '16px',
        width,
        height,
        overflowY: under ? 'auto' : 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <EChart option={option} theme={chartsTheme.echartsTheme} sx={{ width: size, height: size }} />
        <Stack
          sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: spec.center?.fontSize ?? 15,
              fontWeight: spec.center?.fontWeight ?? 650,
              lineHeight: 1.3,
              color: 'text.primary',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {donut.center === undefined ? '–' : formatValue(donut.center, centerFormat)}
          </Typography>
          {spec.center?.label && (
            <Typography
              component="span"
              sx={{
                ...head,
                // As written, without caps: the kinds card's label.
                ...(spec.center.caps === false
                  ? { fontSize: 10.5, fontWeight: 400, letterSpacing: 'normal', textTransform: 'none' }
                  : { fontWeight: 600, letterSpacing: '0.06em' }),
                lineHeight: 1.3,
                maxWidth: '60%',
                textAlign: 'center',
              }}
            >
              {spec.center.label}
            </Typography>
          )}
        </Stack>
      </Box>
      <Box sx={{ width: '100%', maxHeight: under ? undefined : '100%', overflowY: 'auto', minWidth: 0 }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            // Without dividers, rows of 26px 2px apart, as the kinds card's list.
            borderCollapse: dividers ? 'collapse' : 'separate',
            borderSpacing: dividers ? undefined : '0 2px',
            fontSize: 12,
            '& th': { ...head, height: 24, padding: '0 8px', textAlign: 'right' },
            '& td': {
              height: dividers ? 24 : 26,
              padding: '0 8px',
              color: 'text.secondary',
              borderBottom: dividers ? `1px solid ${theme.palette.divider}` : 'none',
              whiteSpace: 'nowrap',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            },
            '& td.name': {
              width: '100%',
              maxWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'left',
            },
            '& td.share': { color: muted },
            '& tbody tr:last-of-type td': { borderBottom: 'none' },
          }}
        >
          {columns.some((c) => c.title) && (
            <thead>
              <tr>
                <th aria-label="Name" />
                {columns.map((c) => (
                  <th key={keyOf(c)}>{c.title}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {slices.map((s) => (
              <tr key={s.key}>
                <td className="name" title={s.name}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      mr: '8px',
                      borderRadius: '2px',
                      bgcolor: s.color,
                    }}
                  />
                  <Box component="span" sx={{ color: 'text.primary' }}>
                    {s.name}
                  </Box>
                </td>
                {columns.map((c) => (
                  <td key={keyOf(c)} className={c.share ? 'share' : undefined}>
                    {cell(s, total, c, spec)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
}
