export type RuleDefinition = {
	specification: string
	inputResolver: string
	directive: string
	priority?: number
}

export type Rule = {
	id: string
	specification: string
	inputResolver: string
	directive: string
	priority?: number
}
