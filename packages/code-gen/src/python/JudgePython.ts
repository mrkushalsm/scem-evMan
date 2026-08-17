import { Judge, ProblemConfig, LanguageConfig, TypeConfig } from '../types';
import * as configFile from './config.json';

const config = configFile as LanguageConfig;

export class JudgePython implements Judge {
    private typeOf(type: string): TypeConfig {
        const typeInfo = config.types[type];
        if (!typeInfo) {
            throw new Error(`Unsupported type "${type}"`);
        }
        return typeInfo;
    }

    generateBoilerplate(problemConfig: ProblemConfig): string {
        const method = problemConfig.method || 'solve';
        const args = (problemConfig.input || []).map(
            (param) => `${param.variable}: ${this.typeOf(param.type).hint}`
        );

        return config.boilerplate
            .split('{method}').join(method)
            .split('{args}').join(args.join(', '));
    }

    wrapCode(userCode: string, problemConfig: ProblemConfig): string {
        return config.template
            .split('{code}').join(userCode)
            .split('{input_reading_code}').join(this.generateInputReader(problemConfig));
    }

    generateInputReader(problemConfig: ProblemConfig): string {
        const lines: string[] = [];
        const variables: string[] = [];
        const indent = '        ';

        for (const param of problemConfig.input || []) {
            const typeInfo = this.typeOf(param.type);
            const reader = typeInfo.reader.split('{var}').join(param.variable);
            lines.push(typeInfo.selfDeclaring ? `${indent}${reader}` : `${indent}${param.variable} = ${reader}`);
            variables.push(param.variable);
        }

        const method = problemConfig.method || 'solve';
        lines.push(`${indent}${method}(${variables.join(', ')})`);

        return lines.join('\n');
    }
}
