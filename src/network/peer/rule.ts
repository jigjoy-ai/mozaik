export type RuleDefinition = {
	condition: string
	input: string
	directive: string | any
	priority?: number
}

export type Rule = {
	id: string
	condition: string
	input: string
	directive: string | any
	priority?: number
}
