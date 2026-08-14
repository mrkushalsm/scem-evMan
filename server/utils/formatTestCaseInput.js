// Formats a test case's input for display as a LeetCode-style example
// (e.g. "nums = [2, 7, 11, 15], target = 9"), independent of the
// judge0-stdin formatting used at judge time (see submitCon.js).

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }
  return String(value ?? '');
};

// Legacy/bulk-imported test cases may store `input` as a raw stdin-style
// string (e.g. "4 9\n2 7 11 15") rather than an object keyed by variable
// name. Best-effort tokenize it against inputVariables, mirroring the
// client's deserializeInput (client/lib/test-case-utils.ts).
const parseStringInput = (input, inputVariables) => {
  const tokens = input.trim().split(/\s+/);
  const result = {};
  let p = 0;

  for (const v of inputVariables) {
    if (p >= tokens.length) break;

    if (v.type && v.type.includes('_array')) {
      const size = parseInt(tokens[p++], 10);
      const elements = [];
      if (!isNaN(size)) {
        for (let i = 0; i < size && p < tokens.length; i++) {
          elements.push(tokens[p++]);
        }
      }
      result[v.variable] = elements;
    } else {
      result[v.variable] = tokens[p++];
    }
  }

  return result;
};

function formatTestCaseInput(input, inputVariables = []) {
  if (!inputVariables || inputVariables.length === 0) {
    return typeof input === 'string' ? input : JSON.stringify(input);
  }

  const values = typeof input === 'string'
    ? parseStringInput(input, inputVariables)
    : (input || {});

  return inputVariables
    .map((v) => `${v.variable} = ${formatValue(values[v.variable])}`)
    .join(', ');
}

module.exports = { formatTestCaseInput };
