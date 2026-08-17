import { Judge, ProblemConfig, LanguageConfig, TypeConfig } from '../types';
import * as configFile from './config.json';

const config = configFile as LanguageConfig;

export class JudgeC implements Judge {
    protected readonly config: LanguageConfig;

    constructor(languageConfig: LanguageConfig = config) {
        this.config = languageConfig;
    }

    protected typeOf(type: string): TypeConfig {
        const typeInfo = this.config.types[type];
        if (!typeInfo) {
            throw new Error(`Unsupported type "${type}"`);
        }
        return typeInfo;
    }

    protected sizeParams(variable: string, typeInfo: TypeConfig): string[] {
        return (typeInfo.sizeParams || []).map((p) => p.split('{var}').join(variable));
    }

    generateBoilerplate(problemConfig: ProblemConfig): string {
        const method = problemConfig.method || 'solve';
        const args: string[] = [];

        for (const param of problemConfig.input || []) {
            const typeInfo = this.typeOf(param.type);
            args.push(`${typeInfo.hint} ${param.variable}`);
            for (const size of this.sizeParams(param.variable, typeInfo)) {
                args.push(`int ${size}`);
            }
        }

        return this.config.boilerplate
            .split('{method}').join(method)
            .split('{args}').join(args.join(', '));
    }

    wrapCode(userCode: string, problemConfig: ProblemConfig): string {
        return this.config.template
            .split('{code}').join(userCode)
            .split('{input_reading_code}').join(this.generateInputReader(problemConfig));
    }

    generateInputReader(problemConfig: ProblemConfig): string {
        const lines: string[] = [];
        const callArgs: string[] = [];
        const indent = '    ';
        const inputs = problemConfig.input || [];

        for (const param of inputs) {
            const typeInfo = this.typeOf(param.type);
            if (!typeInfo.selfDeclaring) {
                lines.push(`${indent}${typeInfo.hint} ${param.variable};`);
            }
        }

        lines.push('');

        for (const param of inputs) {
            const typeInfo = this.typeOf(param.type);
            lines.push(`${indent}${typeInfo.reader.split('{var}').join(param.variable)}`);
            callArgs.push(param.variable, ...this.sizeParams(param.variable, typeInfo));
        }

        if (problemConfig.method) {
            lines.push(`${indent}${problemConfig.method}(${callArgs.join(', ')});`);
        }

        return lines.join('\n');
    }
}
