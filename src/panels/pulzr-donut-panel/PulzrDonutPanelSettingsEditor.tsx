import { TextField, Typography } from '@mui/material';
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
