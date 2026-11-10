import { ChartsProvider, mockChartsContext } from '@perses-dev/components';
import { render, screen } from '@testing-library/react';

import type { PulzrDonutPanelProps } from './pulzr-donut-panel-types';
import { PulzrDonutPanelComponent } from './PulzrDonutPanelComponent';

const series = (name: string, value: number): { name: string; values: Array<[number, number]> } => ({
  name,
  values: [[1, value]],
});

const draw = (props: Partial<PulzrDonutPanelProps>): void => {
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
  );
};

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

  it('says No data without slices', () => {
    draw({});
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
