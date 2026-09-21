import { DomainModel } from "src/environment/domain/domain-model"

export class RuntimeService<TModel extends DomainModel> {
	constructor(public readonly model: TModel) {}
}
