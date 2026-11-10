import { ChartsProvider, mockChartsContext } from '@perses-dev/components';
import { render, screen } from '@testing-library/react';

import type { PulzrDonutPanelProps } from './pulzr-donut-panel-types';
import { PulzrDonutPanelComponent } from './PulzrDonutPanelComponent';

const series = (name: string, value: number): { name: string; values: Array<[number, number]> } => ({
  name,
  values: [[1, value]],
});

const draw = (props: Partial<PulzrDonutPanelProps>): HTMLElement =>
  render(
    <ChartsProvider {...mockChartsContext}>
      <PulzrDonutPanelComponent
        {...({
          queryResults: [],
          spec: {},
          contentDimensions: { width: 500, height: 200 },
          ...props,
        } as PulzrDonutPanelProps)}
      />
    </ChartsProvider>,
  ).container;

describe('PulzrDonutPanelComponent', () => {
  it('draws the middle figure and a row per slice', () => {
    draw({
      queryResults: [
        { data: { series: [series('card · amount', 680), series('card · payers', 700), series('people', 1099)] } },
        { data: { series: [series('cash · amount', 320), series('cash · payers', 399)] } },
      ] as PulzrDonutPanelProps['queryResults'],
      spec: {
        value: 'amount',
        names: { card: 'Card' },
        center: { series: 'people', label: 'People' },
        columns: [{ title: 'Paid' }, { title: 'Share', share: true }, { title: 'People', field: 'payers' }],
      },
    });
    expect(screen.getByText('1,099')).toBeInTheDocument();
    expect(screen.getByText('People', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getAllByRole('row').map((r) => r.textContent)).toEqual([
      'PaidSharePeople',
      'Card68068%700',
      'cash32032%399',
    ]);
  });

  it('draws the kinds as the dashboard does: the table under the donut, missed at the fine', () => {
    const container = draw({
      queryResults: [
        {
          data: {
            series: [
              series('expired · count', 200),
              series('expired · cited', 150),
              series('expired · missed', 50),
              series('expired · typicalFine', 35),
              series('overstay · count', 24),
              series('overstay · cited', 20),
              series('overstay · missed', 4),
            ],
          },
        },
      ] as PulzrDonutPanelProps['queryResults'],
      spec: {
        value: 'count',
        names: { expired: 'Expired meter', overstay: 'Overstay' },
        layout: 'stacked',
        size: { inner: '64%', outer: '96%', padAngle: 1, max: 168 },
        center: { label: 'violations', fontSize: 18, fontWeight: 700 },
        columns: [
          { title: 'Count' },
          { title: 'Share', share: true },
          { title: 'Cited', field: 'cited' },
          {
            title: 'Missed',
            field: 'missed',
            times: 'typicalFine',
            format: { unit: 'usd', decimalPlaces: 2 },
            fallbackFormat: { unit: 'decimal', shortValues: false },
          },
        ],
      },
      contentDimensions: { width: 600, height: 400 },
    });
    expect(screen.getByText('224')).toHaveStyle({ fontSize: '18px', fontWeight: '700' });
    expect(screen.getAllByRole('row').map((r) => r.textContent)).toEqual([
      'CountShareCitedMissed',
      'Expired meter20089%150$1,750.00',
      'Overstay2411%204',
    ]);
    const grid = container.firstElementChild as HTMLElement;
    expect(grid).toHaveStyle({ gridTemplateColumns: 'minmax(0, 1fr)', justifyItems: 'start' });
    expect(grid.firstElementChild).toHaveStyle({ width: '168px', height: '168px' });
  });

  it('says No data without slices', () => {
    draw({});
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
