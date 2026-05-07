const codeQueue = require("./queue");
const { runCode } = require("./utils/executeCode");

console.log("Worker started, waiting for jobs...");

codeQueue.process(async (job) => {
  const { code, testCases, language } = job.data;
  let results = [];
  for (let t of testCases) {
    try {
      const output = await runCode(code, t.input, language || "cpp");
      results.push({
        input: t.input,
        expected: t.expected,
        output: output.trim(),
        result: output.trim() === t.expected.trim() ? "PASS" : "FAIL",
      });
    } catch (err) {
      results.push({
        input: t.input,
        expected: t.expected,
        output: String(err),
        result: "ERROR",
      });
    }
  }
  return results;
});
