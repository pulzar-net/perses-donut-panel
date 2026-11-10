import type { PanelPlugin } from '@perses-dev/plugin-system';

import type { PulzrDonutPanelOptions, PulzrDonutPanelProps } from './pulzr-donut-panel-types';
import { PulzrDonutPanelComponent } from './PulzrDonutPanelComponent';
import { PulzrDonutPanelSettingsEditor } from './PulzrDonutPanelSettingsEditor';

export const PulzrDonutPanel: PanelPlugin<PulzrDonutPanelOptions, PulzrDonutPanelProps> = {
  PanelComponent: PulzrDonutPanelComponent,
  panelOptionsEditorComponents: [{ label: 'Settings', content: PulzrDonutPanelSettingsEditor }],
  supportedQueryTypes: ['TimeSeriesQuery'],
  createInitialOptions: () => ({}),
};
