const mongoose = require("mongoose");
const { getJudge, validateProblemConfig } = require("@pomelo/code-gen");

module.exports = {
  version: 4,
  name: "Regenerate coding boilerplate for the new C/C++ signatures",
  up: async () => {
    const questions = mongoose.connection.db.collection("questions");
    const cursor = questions.find({ type: "coding" });

    for await (const question of cursor) {
      const stored = question.boilerplateCode || {};
      const config = {
        method: question.functionName,
        input: (question.inputVariables || []).map((v) => ({
          variable: v.variable,
          type: v.type,
        })),
      };

      const errors = validateProblemConfig(config);
      if (errors.length > 0) {
        console.warn(`[Migrations] Skipping question ${question._id}: ${errors.join("; ")}`);
        continue;
      }

      const boilerplateCode = {};
      for (const lang of Object.keys(stored)) {
        boilerplateCode[lang] = getJudge(lang).generateBoilerplate(config);
      }

      await questions.updateOne({ _id: question._id }, { $set: { boilerplateCode } });
    }
  },
};
