package model

import (
	"github.com/perses/shared/cue/common"
)

kind: "PulzrDonutPanel"
spec: close({
	// The slices' values.
	format?: common.#format
	// The field whose series are the slices when series are named `<category> · <field>`.
	value?: string & !=""
	// A display name per category.
	names?: [string]: string
	// A color per category, any CSS color.
	colors?: [string]: string & !=""
	// The figure in the middle: the named series' last value, else the total of the slices.
	center?: close({
		series?:     string & !=""
		label?:      string
		format?:     common.#format
		fontSize?:   number & >0
		fontWeight?: int & >=100 & <=1000
		// The label in capitals; false: as written.
		caps?: bool
	})
	// The table's columns after each slice's name: its share, a field's value, or its value.
	columns?: [...close({
		title:           string
		field?:          string & !=""
		share?:          bool
		// The value times the `<category> · <times>` series' value; alone in fallbackFormat without it.
		times?:          string & !=""
		fallbackFormat?: common.#format
		// A time in parts from the value in format.unit (seconds, minutes or hours; minutes unless set).
		timeInParts?:    bool
		format?:         common.#format
	})]
	// Past this many slices, the smallest fold into Other.
	limit?: int & >=2
	// The table beside the donut, or under it.
	layout?: "side" | "stacked"
	// The donut's radii as percentages, the gap between slices in degrees, its largest diameter in px.
	size?: close({
		inner?:    =~"^[0-9]+(\\.[0-9]+)?%$"
		outer?:    =~"^[0-9]+(\\.[0-9]+)?%$"
		padAngle?: number & >=0
		max?:      number & >0
		// The card-colored edge round each slice, in px.
		edge?: number & >=0
	})
	// A line under each row of the table.
	dividers?: bool
})
