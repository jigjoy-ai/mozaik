import ts from "typescript-eslint"
export default ts.config(...ts.configs.recommended, { ignores: ["dist/**"] })
