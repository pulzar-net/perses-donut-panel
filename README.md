# Donut panel for Perses

`PulzrDonutPanel` draws shares of a whole: a donut with a figure in the middle, and a table of its slices beside it. How people paid, with the people in the middle; violations by kind, with what was cited and missed.

```yaml
kind: Panel
spec:
  plugin:
    kind: PulzrDonutPanel
    spec:
      value: amount
      format: { unit: decimal, decimalPlaces: 0 }
      names: { apple_pay: Apple Pay, card: Card }
      colors: { card: '#6366f1' }
      center: { series: people, label: People }
      columns:
        - { title: Paid }
        - { title: Share, share: true }
        - { title: People, field: payers }
      limit: 6
```

- Each slice is a series, valued by its last value that is a number. A series is named `<category>`, or `<category> · <field>` when a category has several fields. Series labelled `compare` (the period before) are left out, and so are slices of nothing. Slices are drawn largest first.
- `value`: the field whose `<category> · <field>` series are the slices; the category's other fields go in the table. Without it every series is a slice, named by its whole name.
- `names`: a display name per category (`apple_pay: Apple Pay`). `colors`: a color per category, any CSS color; the rest take the theme's palette in the order the query gives them, so a category keeps its color as amounts move.
- `center`: the figure in the middle. `series` is a series' last value (it is not a slice, and may come from another query of the panel; `–` when it has none); without it, the total of the slices. `label` goes under it, `format` formats it, `fontSize` and `fontWeight` set its type (15px and 650 unless set).
- `columns`: the table's columns after each slice's swatch and name, each with a `title`. `share: true` is the slice's share of the total, a whole percent; `field: payers` is the `<category> · payers` series' value; a column with neither is the slice's value. Each takes a `format`. Without `columns`, the table is the value and its share, with no header.
  - `times: typicalFine` multiplies the column's value by the `<category> · typicalFine` series' value (missed times the fine, in the column's `format`); a category without that series shows the value alone in `fallbackFormat` (a plain figure unless set). Into Other go the products, summed.
  - `timeInParts: true` writes the value as a time in parts: `45m`, `6h 46m`, `7h`, and past two days `2d 3h`, the minutes rounded. The value is in minutes, or in seconds or hours when the column's `format.unit` says so.
- `limit`: at most this many slices; past it the smallest fold into Other. No folding unless set.
- `format` formats the slices' values in the table and tooltips (any Perses format); without a format a figure is written in full, `1,099`.
- `layout`: `side` (the default) puts the table beside the donut, which is square and as large as the panel's height allows; narrower than 300px the table goes under it. `stacked` puts the donut on top, at the left, and the table across the whole width under it.
- `size`: the donut's `inner` and `outer` radii as percentages (`62%` and `100%` unless set), `padAngle` the gap between slices in degrees (1.5 unless set), and `max` its largest diameter in px (140 when stacked unless set).
- "No data" shows when there are no slices.

Violations by kind, the table under the donut, and what went uncited at the kind's fine, or the count where a kind has none:

```yaml
value: count
layout: stacked
size: { inner: 64%, outer: 96%, padAngle: 1, max: 168 }
center: { label: violations, fontSize: 18, fontWeight: 700 }
columns:
  - { title: Count }
  - { title: Share, share: true }
  - { title: Cited, field: cited }
  - title: Missed
    field: missed
    times: typicalFine
    format: { unit: usd, decimalPlaces: 2 }
    fallbackFormat: { unit: decimal, shortValues: false }
```

Without citations, the third column is how long they were in breach: `{ title: In breach, field: minutes, timeInParts: true }`.

## Install

Put the archive (`PulzrDonutPanel-<version>.tar.gz`, from the releases) in a folder listed in the Perses server's `plugin.archive_paths`, or `npm install @pulzr/perses-donut-panel` to embed it.

## Development

```bash
npm install
npm test
percli plugin test-schemas
npm run build
percli plugin build
```

### Releasing

Set the new version in `package.json`, commit, then tag and push it:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

The Release workflow tests and builds, publishes the package to npm with provenance, and attaches the Perses plugin archive and the npm tarball to a GitHub release.

## License

Apache 2.0.
