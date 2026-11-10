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
		series?: string & !=""
		label?:  string
		format?: common.#format
	})
	// The table's columns after each slice's name: its share, a field's value, or its value.
	columns?: [...close({
		title:   string
		field?:  string & !=""
		share?:  bool
		format?: common.#format
	})]
	// Past this many slices, the smallest fold into Other.
	limit?: int & >=2
})
