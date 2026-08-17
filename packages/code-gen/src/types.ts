export interface TypeConfig {
    reader: string;
    hint: string;
    sizeParams?: string[];
    selfDeclaring?: boolean;
}

export interface LanguageConfig {
    boilerplate: string;
    template: string;
    types: Record<string, TypeConfig>;
}

export interface ProblemInput {
    variable: string;
    type: string;
}

export interface ProblemConfig {
    method?: string;
    input: ProblemInput[];
}

export interface TestCase {
    input: string;
    output: string;
}

export interface Judge {
    generateBoilerplate(config: ProblemConfig): string;
    wrapCode(userCode: string, config: ProblemConfig): string;
}
