const test = require("node:test");
const assert = require("node:assert");
const { getJudge, validateProblemConfig } = require("@pomelo/code-gen");

const CONFIG = {
    method: "solve",
    input: [
        { variable: "target", type: "int" },
        { variable: "nums", type: "int_array" },
        { variable: "grid", type: "int_matrix" },
        { variable: "flag", type: "bool" },
    ],
};

test("validateProblemConfig accepts a well-formed signature", () => {
    assert.deepStrictEqual(validateProblemConfig(CONFIG), []);
});

test("validateProblemConfig rejects a name colliding with a generated length param", () => {
    const errors = validateProblemConfig({
        method: "solve",
        input: [
            { variable: "nums", type: "int_array" },
            { variable: "nums_size", type: "int" },
        ],
    });
    assert.match(errors.join(" "), /nums_size.*collides/);
});

test("validateProblemConfig rejects keywords, driver names and bad identifiers", () => {
    const cases = [
        [{ method: "main", input: [{ variable: "a", type: "int" }] }, /main/],
        [{ method: "class", input: [{ variable: "a", type: "int" }] }, /class/],
        [{ method: "solve", input: [{ variable: "iterator", type: "int" }] }, /iterator/],
        [{ method: "solve", input: [{ variable: "2nd", type: "int" }] }, /2nd/],
        [{ method: "my func", input: [{ variable: "a", type: "int" }] }, /my func/],
    ];
    for (const [config, pattern] of cases) {
        assert.match(validateProblemConfig(config).join(" "), pattern);
    }
});

test("validateProblemConfig rejects duplicates and unknown types", () => {
    const errors = validateProblemConfig({
        method: "solve",
        input: [
            { variable: "a", type: "int" },
            { variable: "a", type: "int" },
            { variable: "b", type: "tree" },
        ],
    });
    assert.match(errors.join(" "), /used more than once/);
    assert.match(errors.join(" "), /Unsupported type "tree"/);
});

for (const lang of ["c", "cpp", "java", "python"]) {
    test(`${lang} driver declares, reads and passes every variable`, () => {
        const driver = getJudge(lang).wrapCode("USER_CODE", CONFIG);

        for (const param of CONFIG.input) {
            assert.ok(driver.includes(param.variable), `${lang} driver never mentions ${param.variable}`);
        }
        assert.ok(!driver.includes("[1000]"), `${lang} driver still uses a fixed-size buffer`);
        assert.ok(driver.includes("USER_CODE"), `${lang} driver dropped the user's code`);
    });

    test(`${lang} passes C-style size params only where the signature declares them`, () => {
        const stub = getJudge(lang).generateBoilerplate(CONFIG);
        const driver = getJudge(lang).wrapCode("USER_CODE", CONFIG);
        const call = driver.split("solve(")[1].split(")")[0];

        assert.strictEqual(
            stub.includes("nums_size"),
            call.includes("nums_size"),
            `${lang} stub and call disagree about nums_size`
        );
        assert.strictEqual(lang === "c", call.includes("nums_size"));
    });

    test(`${lang} rejects an unsupported type instead of emitting broken code`, () => {
        assert.throws(
            () => getJudge(lang).wrapCode("x", { method: "solve", input: [{ variable: "t", type: "tree" }] }),
            /Unsupported type "tree"/
        );
    });

    test(`${lang} keeps replacement patterns in user code verbatim`, () => {
        const code = "const s = \"$& $` $' $1\";";
        assert.ok(getJudge(lang).wrapCode(code, CONFIG).includes(code));
    });
}

test("java hoists only real leading imports", () => {
    const code = [
        "import java.util.List;",
        "class Code {",
        '    static String s = "import java.io.File;";',
        "}",
    ].join("\n");
    const wrapped = getJudge("java").wrapCode(code, CONFIG);

    assert.ok(wrapped.startsWith("import java.util.List;"));
    assert.ok(wrapped.includes('static String s = "import java.io.File;";'));
    assert.strictEqual(wrapped.split("import java.io.File;").length, 2);
});
