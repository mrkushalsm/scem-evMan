
export interface InputVariable {
    variable: string;
    type: string;
}

const toBoolToken = (val: unknown): string => {
    if (typeof val === "boolean") return val ? "1" : "0";
    const text = String(val ?? "").trim().toLowerCase();
    return text === "true" || text === "1" ? "1" : "0";
};

export function serializeInput(
    inputValues: Record<string, unknown>,
    variables: InputVariable[]
): string {
    if (!variables || variables.length === 0) return "";

    const parts: string[] = [];

    for (const v of variables) {
        const val = inputValues[v.variable];

        if (v.type.endsWith("_matrix")) {
            const rows: unknown[][] = Array.isArray(val)
                ? val.map((r) => (Array.isArray(r) ? r : []))
                : [];
            parts.push(String(rows.length), String(rows[0]?.length ?? 0));
            rows.forEach((row) => row.forEach((item) => parts.push(String(item))));
        } else if (v.type.endsWith("_array")) {
            let arr: unknown[] = [];
            if (Array.isArray(val)) {
                arr = val;
            } else if (typeof val === "string") {
                arr = val.split(",").map((s) => s.trim()).filter((s) => s !== "");
            }

            parts.push(String(arr.length));
            arr.forEach((item) => parts.push(String(item)));
        } else if (v.type === "bool") {
            parts.push(toBoolToken(val));
        } else {
            parts.push(String(val ?? ""));
        }
    }

    return parts.join(" ");
}

export function deserializeInput(
    serialized: string,
    variables: InputVariable[]
): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (!serialized || !variables || variables.length === 0) return result;

    const tokens = serialized.trim().split(/\s+/);
    let p = 0;

    for (const v of variables) {
        if (p >= tokens.length) break;

        if (v.type.endsWith("_matrix")) {
            const rows = parseInt(tokens[p++], 10);
            const cols = parseInt(tokens[p++], 10);
            const matrix: string[][] = [];

            if (!isNaN(rows) && !isNaN(cols)) {
                for (let i = 0; i < rows; i++) {
                    const row: string[] = [];
                    for (let j = 0; j < cols && p < tokens.length; j++) {
                        row.push(tokens[p++]);
                    }
                    matrix.push(row);
                }
            }

            result[v.variable] = matrix;
        } else if (v.type.endsWith("_array")) {
            const size = parseInt(tokens[p++], 10);

            if (isNaN(size)) {
                result[v.variable] = [];
                continue;
            }

            const elements: string[] = [];
            for (let i = 0; i < size; i++) {
                if (p < tokens.length) {
                    elements.push(tokens[p++]);
                }
            }

            result[v.variable] = elements;
        } else {
            result[v.variable] = tokens[p++];
        }
    }

    return result;
}
