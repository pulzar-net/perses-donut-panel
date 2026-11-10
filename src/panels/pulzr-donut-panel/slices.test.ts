import type { TimeSeriesData } from '@perses-dev/spec';

import { cell, columnsOf, donutOf, share, timeInParts } from './slices';

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

  it('multiply a field by the times field, else give the field alone in the fallback format', () => {
    const missed = {
      title: 'Missed',
      field: 'missed',
      times: 'typicalFine',
      format: { unit: 'usd' as const, decimalPlaces: 2 },
      fallbackFormat: { unit: 'decimal' as const, shortValues: false },
    };
    const spec = { value: 'count', columns: [missed] };
    const d = donutOf(
      [
        data(
          at('expired · count', 9),
          at('expired · missed', 1500),
          at('expired · typicalFine', 25.5),
          at('blocked · count', 3),
          at('blocked · missed', 1200),
        ),
      ],
      spec,
      palette,
      '#o',
    );
    expect(d.slices.map((s) => cell(s, d.total, missed, spec))).toEqual(['$38,250.00', '1,200']);
  });

  it('sum the products, not the factors, into Other', () => {
    const missed = { title: 'Missed', field: 'missed', times: 'fine' };
    const spec = { value: 'v', limit: 2, columns: [missed] };
    const d = donutOf(
      [
        data(
          at('a · v', 9),
          at('b · v', 2),
          at('b · missed', 2),
          at('b · fine', 10),
          at('c · v', 1),
          at('c · missed', 3),
          at('c · fine', 20),
        ),
      ],
      spec,
      palette,
      '#o',
    );
    expect(d.slices.map((s) => cell(s, d.total, missed, spec))).toEqual(['–', '80']);
  });

  it('write a time in parts', () => {
    const kind = { key: 'k', name: 'K', value: 1, color: '#000', fields: { minutes: 406.4 } };
    expect(cell(kind, 1, { title: 'In breach', field: 'minutes', timeInParts: true }, {})).toBe('6h 46m');
  });
});

describe('timeInParts', () => {
  it('says minutes, hours and minutes, and past two days days and hours', () => {
    expect([45, 406, 420, 2879, 2880, 3060, 3119, 4320].map((m) => timeInParts(m, undefined))).toEqual([
      '45m',
      '6h 46m',
      '7h',
      '47h 59m',
      '2d',
      '2d 3h',
      '2d 3h',
      '3d',
    ]);
    expect(timeInParts(0.4, 'minutes')).toBe('0m');
  });

  it('reads seconds and hours, minutes for any other unit', () => {
    expect(timeInParts(2700, 'seconds')).toBe('45m');
    expect(timeInParts(1.5, 'hours')).toBe('1h 30m');
    expect(timeInParts(45, 'decimal')).toBe('45m');
  });
});
