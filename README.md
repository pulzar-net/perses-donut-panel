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
- `center`: the figure in the middle. `series` is a series' last value (it is not a slice, and may come from another query of the panel; `–` when it has none); without it, the total of the slices. `label` goes under it, `format` formats it.
- `columns`: the table's columns after each slice's swatch and name, each with a `title`. `share: true` is the slice's share of the total, a whole percent; `field: payers` is the `<category> · payers` series' value; a column with neither is the slice's value. Each takes a `format`. Without `columns`, the table is the value and its share, with no header.
- `limit`: at most this many slices; past it the smallest fold into Other. No folding unless set.
- `format` formats the slices' values in the table and tooltips (any Perses format); without a format a figure is written in full, `1,099`.
- The donut is square, as large as the panel's height allows, the table beside it; narrower than 300px the table goes under it. "No data" shows when there are no slices.

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
