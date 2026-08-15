import { Judge, ProblemConfig, LanguageConfig } from '../types';
import * as configFile from './config.json';

const config = configFile as LanguageConfig;

// C and C++ generate the same wrapper shape — declare, read from stdin, call the
// user's function — and differ only in their config. The logic lives here and the
// C++ judge supplies its own config rather than repeating it.
export class JudgeC implements Judge {
    protected readonly config: LanguageConfig;

    constructor(languageConfig: LanguageConfig = config) {
        this.config = languageConfig;
    }

    generateBoilerplate(problemConfig: ProblemConfig): string {
        const method = problemConfig.method || 'solve';
        const args: string[] = [];
        const typeConfig = this.config.types;

        if (problemConfig.input && Array.isArray(problemConfig.input)) {
            for (const param of problemConfig.input) {
                const typeInfo = typeConfig[param.type] || { hint: 'void', reader: '' };
                args.push(`${typeInfo.hint} ${param.variable}`);
                if (param.type.includes('array')) {
                    args.push(`int ${param.variable}_size`);
                }
            }
        }

        return this.config.boilerplate
            .replace('{method}', method)
            .replace('{args}', args.join(', '));
    }

    wrapCode(userCode: string, problemConfig: ProblemConfig): string {
        const template = this.config.template;
        const inputReadingCode = this.generateInputReader(problemConfig);

        return template
            .replace('{code}', userCode)
            .replace('{input_reading_code}', inputReadingCode);
    }

    generateInputReader(problemConfig: ProblemConfig): string {
        const lines: string[] = [];
        const variables: string[] = [];
        const indent = "    ";
        const typeConfig = this.config.types;

        if (problemConfig.input && Array.isArray(problemConfig.input)) {
            // Declare variables
            for (const param of problemConfig.input) {
                const typeInfo = typeConfig[param.type] || { hint: 'int', reader: '' };
                if (param.type.includes('array')) {
                    lines.push(`${indent}${typeInfo.hint.replace('*', '')} ${param.variable}[1000];`);
                    lines.push(`${indent}int ${param.variable}_size = 0;`);
                } else {
                    lines.push(`${indent}${typeInfo.hint} ${param.variable};`);
                }
            }

            lines.push("");

            // Read variables
            for (const param of problemConfig.input) {
                const typeConf = typeConfig[param.type];

                if (typeConf && typeConf.reader) {
                    let reader = typeConf.reader.replace(/{var}/g, param.variable);
                    lines.push(`${indent}${reader}`);
                }
                variables.push(param.variable);
            }
        }

        if (problemConfig.method) {
            const callArgs: string[] = [];
            for (const param of problemConfig.input) {
                callArgs.push(param.variable);
                if (param.type.includes('array')) {
                    callArgs.push(`${param.variable}_size`);
                }
            }
            lines.push(`${indent}${problemConfig.method}(${callArgs.join(', ')});`);
        }

        return lines.join('\n');
    }
}
