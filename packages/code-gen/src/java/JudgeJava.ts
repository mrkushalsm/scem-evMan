import { Judge, ProblemConfig, LanguageConfig, TypeConfig } from '../types';
import * as configFile from './config.json';

const config = configFile as LanguageConfig;

function extractImports(userCode: string): { imports: string[]; body: string } {
    const lines = userCode.split('\n');
    const imports: string[] = [];
    let inBlockComment = false;
    let i = 0;

    for (; i < lines.length; i++) {
        let line = lines[i];

        if (inBlockComment) {
            const end = line.indexOf('*/');
            if (end === -1) continue;
            inBlockComment = false;
            line = line.slice(end + 2);
        }

        const stripped = line.replace(/\/\*.*?\*\//g, '').trim();
        if (stripped === '' || stripped.startsWith('//')) continue;

        const blockStart = stripped.indexOf('/*');
        if (blockStart !== -1) {
            inBlockComment = true;
            if (stripped.slice(0, blockStart).trim() === '') continue;
            break;
        }

        if (/^import\s+[\w.]+\s*(\.\s*\*\s*)?;$/.test(stripped)) {
            imports.push(stripped);
            lines[i] = '';
            continue;
        }

        break;
    }

    return { imports, body: lines.join('\n').trim() };
}

export class JudgeJava implements Judge {
    private typeOf(type: string): TypeConfig {
        const typeInfo = config.types[type];
        if (!typeInfo) {
            throw new Error(`Unsupported type "${type}"`);
        }
        return typeInfo;
    }

    wrapCode(userCode: string, problemConfig: ProblemConfig): string {
        const { imports, body } = extractImports(userCode);

        const finalCode = config.template
            .split('{code}').join(body)
            .split('{input_reading_code}').join(this.generateInputReader(problemConfig));

        return imports.join('\n') + '\n' + finalCode;
    }

    generateInputReader(problemConfig: ProblemConfig): string {
        const lines: string[] = [];
        const variables: string[] = [];
        const indent = '        ';

        for (const param of problemConfig.input || []) {
            const typeInfo = this.typeOf(param.type);
            const reader = typeInfo.reader.split('{var}').join(param.variable);
            lines.push(
                typeInfo.selfDeclaring
                    ? `${indent}${reader}`
                    : `${indent}${typeInfo.hint} ${param.variable} = ${reader};`
            );
            variables.push(param.variable);
        }

        if (problemConfig.method) {
            lines.push(`${indent}Code.${problemConfig.method}(${variables.join(', ')});`);
        }

        return lines.join('\n');
    }

    generateBoilerplate(problemConfig: ProblemConfig): string {
        const method = problemConfig.method || 'solve';
        const args = (problemConfig.input || []).map(
            (param) => `${this.typeOf(param.type).hint} ${param.variable}`
        );

        return config.boilerplate
            .split('{method}').join(method)
            .split('{args}').join(args.join(', '));
    }
}
