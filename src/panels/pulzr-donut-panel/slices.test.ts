import type { TimeSeriesData } from '@perses-dev/spec';

import { cell, columnsOf, donutOf, share } from './slices';

const at = (name: string, value: number | null, extra: object = {}): TimeSeriesData['series'][number] => ({
  name,
  values: [[1, value]],
  ...extra,
});
const data = (...series: TimeSeriesData['series']): { data: TimeSeriesData } => ({ data: { series } });
const palette = ['#p1', '#p2', '#p3'];
const brief = (d: ReturnType<typeof donutOf>): Array<[string, number, string]> =>
  d.slices.map((s) => [s.name, s.value, s.color]);

describe('donutOf', () => {
  it('is a slice per series by its whole name, largest first, colored in query order', () => {
    const d = donutOf([data(at('card', 2), at('cash', 5), at('none', 0), at('gone', null))], {}, palette, '#o');
    expect(brief(d)).toEqual([
      ['cash', 5, '#p2'],
      ['card', 2, '#p1'],
    ]);
    expect(d.total).toBe(7);
    expect(d.center).toBe(7);
  });

  it('takes the last value that is a number', () => {
    const series = {
      name: 'card',
      values: [
        [0, 4],
        [1, null],
      ] as Array<[number, number | null]>,
    };
    expect(donutOf([data(series)], {}, palette, '#o').total).toBe(4);
  });

  it('takes the value field as the slices and keeps the other fields', () => {
    const d = donutOf(
      [data(at('card · amount', 680), at('card · payers', 700), at('cash · amount', 320), at('cash · payers', 399))],
      { value: 'amount' },
      palette,
      '#o',
    );
    expect(d.slices.map((s) => [s.key, s.value, s.fields])).toEqual([
      ['card', 680, { payers: 700 }],
      ['cash', 320, { payers: 399 }],
    ]);
  });

  it('names and colors categories as set, the rest from the palette in order', () => {
    const d = donutOf(
      [data(at('apple_pay', 1), at('card', 3), at('cash', 2))],
      { names: { apple_pay: 'Apple Pay' }, colors: { card: '#000' } },
      palette,
      '#o',
    );
    expect(brief(d)).toEqual([
      ['card', 3, '#000'],
      ['cash', 2, '#p2'],
      ['Apple Pay', 1, '#p1'],
    ]);
  });

  it('puts a series in the middle, from any query, and leaves it out of the slices', () => {
    const spec = { value: 'amount', center: { series: 'people' } };
    const d = donutOf(
      [data(at('card · amount', 3), at('cash · amount', 1)), data(at('people', 1099))],
      spec,
      palette,
      '#o',
    );
    expect(d.slices.map((s) => s.key)).toEqual(['card', 'cash']);
    expect(d.center).toBe(1099);
    expect(donutOf([data(at('card · amount', 3))], spec, palette, '#o').center).toBeUndefined();
  });

  it('folds the smallest into Other past the limit, fields summed', () => {
    const d = donutOf(
      [data(at('a · v', 5), at('b · v', 4), at('c · v', 2), at('c · n', 1), at('d · v', 1), at('d · n', 2))],
      { value: 'v', limit: 3 },
      palette,
      '#o',
    );
    expect(d.slices.map((s) => [s.name, s.value, s.color, s.fields])).toEqual([
      ['a', 5, '#p1', {}],
      ['b', 4, '#p2', {}],
      ['Other', 3, '#o', { n: 3 }],
    ]);
    expect(d.total).toBe(12);
    expect(donutOf([data(at('a', 1), at('b', 1))], { limit: 2 }, palette, '#o').slices).toHaveLength(2);
  });

  it('leaves out the period compared, and has nothing without data', () => {
    const d = donutOf([data(at('card', 1), at('card', 9, { labels: { compare: 'previous' } }))], {}, palette, '#o');
    expect(brief(d)).toEqual([['card', 1, '#p1']]);
    expect(donutOf([], {}, palette, '#o').slices).toEqual([]);
    expect(donutOf([{ data: undefined }], {}, palette, '#o').slices).toEqual([]);
  });
});

describe('columns', () => {
  const slice = { key: 'card', name: 'Card', value: 680, color: '#000', fields: { payers: 1099 } };

  it('are the value and its share unless set', () => {
    expect(columnsOf({}).map((c) => cell(slice, 1000, c, {}))).toEqual(['680', '68%']);
  });

  it('give a field, a share or the value, each in its format', () => {
    const spec = {
      format: { unit: 'decimal' as const, decimalPlaces: 2 },
      columns: [{ title: 'Paid' }, { title: 'Share', share: true }, { title: 'People', field: 'payers' }],
    };
    expect(columnsOf(spec).map((c) => cell(slice, 1000, c, spec))).toEqual(['680.00', '68%', '1,099']);
    expect(cell(slice, 1000, { title: 'Missed', field: 'missed' }, spec)).toBe('–');
  });

  it('round a share to a whole percent', () => {
    expect(share(1, 3)).toBe('33%');
    expect(share(1, 0)).toBe('0%');
  });
});
