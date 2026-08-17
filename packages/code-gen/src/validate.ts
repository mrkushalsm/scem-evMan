import { ProblemConfig } from './types';

export const SUPPORTED_TYPES = [
    'int',
    'long',
    'float',
    'double',
    'bool',
    'char',
    'string',
    'int_array',
    'float_array',
    'string_array',
    'int_matrix',
] as const;

export type SupportedType = (typeof SUPPORTED_TYPES)[number];

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

const KEYWORDS = new Set([
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
    'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long',
    'register', 'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct',
    'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while',
    'alignas', 'alignof', 'and', 'asm', 'bitand', 'bitor', 'bool', 'catch', 'class',
    'compl', 'concept', 'consteval', 'constexpr', 'constinit', 'const_cast', 'decltype',
    'delete', 'dynamic_cast', 'explicit', 'export', 'false', 'friend', 'mutable',
    'namespace', 'new', 'noexcept', 'not', 'nullptr', 'operator', 'or', 'private',
    'protected', 'public', 'reinterpret_cast', 'requires', 'static_assert',
    'static_cast', 'template', 'this', 'thread_local', 'throw', 'true', 'try',
    'typeid', 'typename', 'using', 'virtual', 'wchar_t', 'xor',
    'abstract', 'assert', 'boolean', 'byte', 'extends', 'final', 'finally',
    'implements', 'import', 'instanceof', 'interface', 'native', 'package', 'strictfp',
    'super', 'synchronized', 'throws', 'transient', 'var', 'record', 'sealed', 'yield',
    'and', 'as', 'async', 'await', 'def', 'del', 'elif', 'except', 'from', 'global',
    'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'with',
]);

const DRIVER_NAMES = new Set([
    'main', 'Main', 'Code', 'args', 'scanner', 'iterator', 'input_data', 'i', 'j',
    'std', 'sys', 'cin', 'cout', 'printf', 'scanf', 'malloc', 'System', 'Scanner',
]);

const SIZE_SUFFIXES = ['_size', '_rows', '_cols'];

function checkName(name: unknown, label: string, errors: string[]): void {
    if (typeof name !== 'string' || name.trim() === '') {
        errors.push(`${label} is required`);
        return;
    }
    const trimmed = name.trim();
    if (!IDENTIFIER.test(trimmed)) {
        errors.push(`${label} "${trimmed}" is not a valid identifier (letters, digits and underscore only, cannot start with a digit)`);
        return;
    }
    if (KEYWORDS.has(trimmed)) {
        errors.push(`${label} "${trimmed}" is a reserved keyword in one of the supported languages`);
        return;
    }
    if (DRIVER_NAMES.has(trimmed)) {
        errors.push(`${label} "${trimmed}" is used by the generated test harness and would be shadowed`);
    }
}

export function validateProblemConfig(config: ProblemConfig): string[] {
    const errors: string[] = [];

    checkName(config.method, 'Function name', errors);

    const inputs = Array.isArray(config.input) ? config.input : [];
    if (inputs.length === 0) {
        errors.push('At least one input variable is required');
    }

    const seen = new Set<string>();
    const generated = new Map<string, string>();

    for (const param of inputs) {
        const name = typeof param?.variable === 'string' ? param.variable.trim() : '';
        checkName(param?.variable, 'Variable name', errors);

        if (name) {
            if (seen.has(name)) {
                errors.push(`Variable name "${name}" is used more than once`);
            }
            seen.add(name);
        }

        if (!SUPPORTED_TYPES.includes(param?.type as SupportedType)) {
            errors.push(`Unsupported type "${param?.type}"${name ? ` for variable "${name}"` : ''}`);
            continue;
        }

        if (name && (param.type.endsWith('_array') || param.type.endsWith('_matrix'))) {
            for (const suffix of SIZE_SUFFIXES) {
                generated.set(`${name}${suffix}`, name);
            }
        }
    }

    for (const name of seen) {
        const owner = generated.get(name);
        if (owner && owner !== name) {
            errors.push(`Variable name "${name}" collides with the length parameter generated for "${owner}"`);
        }
    }

    if (config.method && generated.has(config.method.trim())) {
        errors.push(`Function name "${config.method.trim()}" collides with a generated length parameter`);
    }

    return errors;
}
