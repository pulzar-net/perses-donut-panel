import { MenuItem, TextField, Typography } from '@mui/material';
import { FormatControls, OptionsEditorColumn, OptionsEditorGrid, OptionsEditorGroup } from '@perses-dev/components';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import type { PulzrDonutPanelOptions } from './pulzr-donut-panel-types';

const text = (v: string): string | undefined => (v.trim() ? v : undefined);
const number = (v: string): number | undefined => (v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Number(v));

export function PulzrDonutPanelSettingsEditor({
  value,
  onChange,
}: OptionsEditorProps<PulzrDonutPanelOptions>): ReactElement {
  const center = (patch: Partial<NonNullable<PulzrDonutPanelOptions['center']>>): void =>
    onChange({ ...value, center: { ...value.center, ...patch } });
  const size = (patch: Partial<NonNullable<PulzrDonutPanelOptions['size']>>): void =>
    onChange({ ...value, size: { ...value.size, ...patch } });
  return (
    <OptionsEditorGrid>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Slices">
          <TextField
            size="small"
            label="Value field"
            helperText="Series named `<category> · <field>`: the field that is the slices. Empty: every series."
            value={value.value ?? ''}
            onChange={(e) => onChange({ ...value, value: text(e.target.value) })}
          />
          <TextField
            size="small"
            type="number"
            label="Limit"
            helperText="Past this many, the smallest fold into Other."
            value={value.limit ?? ''}
            slotProps={{ htmlInput: { min: 2 } }}
            onChange={(e) => onChange({ ...value, limit: number(e.target.value) })}
          />
          <Typography variant="caption" color="text.secondary">
            Names, colors and the table columns are set in the panel JSON.
          </Typography>
        </OptionsEditorGroup>
        <OptionsEditorGroup title="Middle">
          <TextField
            size="small"
            label="Series"
            helperText="Its last value. Empty: the total of the slices."
            value={value.center?.series ?? ''}
            onChange={(e) => center({ series: text(e.target.value) })}
          />
          <TextField
            size="small"
            label="Label"
            value={value.center?.label ?? ''}
            onChange={(e) => center({ label: text(e.target.value) })}
          />
          <TextField
            size="small"
            type="number"
            label="Font size"
            helperText="In px; 15 unless set."
            value={value.center?.fontSize ?? ''}
            slotProps={{ htmlInput: { min: 1 } }}
            onChange={(e) => center({ fontSize: number(e.target.value) })}
          />
          <TextField
            size="small"
            type="number"
            label="Font weight"
            helperText="650 unless set."
            value={value.center?.fontWeight ?? ''}
            slotProps={{ htmlInput: { min: 100, max: 1000, step: 50 } }}
            onChange={(e) => center({ fontWeight: number(e.target.value) })}
          />
        </OptionsEditorGroup>
        <OptionsEditorGroup title="Donut">
          <TextField
            select
            size="small"
            label="Layout"
            value={value.layout ?? 'side'}
            onChange={(e) => onChange({ ...value, layout: e.target.value === 'stacked' ? 'stacked' : undefined })}
          >
            <MenuItem value="side">Table beside the donut</MenuItem>
            <MenuItem value="stacked">Table under the donut</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Inner radius"
            helperText="A percentage; 62% unless set."
            value={value.size?.inner ?? ''}
            onChange={(e) => size({ inner: text(e.target.value) })}
          />
          <TextField
            size="small"
            label="Outer radius"
            helperText="A percentage; 100% unless set."
            value={value.size?.outer ?? ''}
            onChange={(e) => size({ outer: text(e.target.value) })}
          />
          <TextField
            size="small"
            type="number"
            label="Gap"
            helperText="Between slices, in degrees; 1.5 unless set."
            value={value.size?.padAngle ?? ''}
            slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
            onChange={(e) => size({ padAngle: number(e.target.value) })}
          />
          <TextField
            size="small"
            type="number"
            label="Largest size"
            helperText="The donut's diameter at most, in px."
            value={value.size?.max ?? ''}
            slotProps={{ htmlInput: { min: 1 } }}
            onChange={(e) => size({ max: number(e.target.value) })}
          />
        </OptionsEditorGroup>
      </OptionsEditorColumn>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Format">
          <FormatControls
            value={value.format ?? { unit: 'decimal' }}
            onChange={(format) => onChange({ ...value, format })}
          />
        </OptionsEditorGroup>
      </OptionsEditorColumn>
    </OptionsEditorGrid>
  );
}
