const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

exports.runCode = (code, input, language) => {
  return new Promise((resolve, reject) => {
    const jobId = Date.now() + "-" + Math.random().toString(36).slice(2);
    const dir = path.join("/app/temp", jobId);
    fs.mkdirSync(dir, { recursive: true });
    const inputPath = path.join(dir, "input.txt");
    fs.writeFileSync(inputPath, input);
    let command;
    if (language === "java") {
      const codePath = path.join(dir, "Main.java");
      fs.writeFileSync(codePath, code);
      command = "javac " + codePath + " -d " + dir + " && java -cp " + dir + " Main < " + inputPath;
    } else if (language === "python") {
      const codePath = path.join(dir, "main.py");
      fs.writeFileSync(codePath, code);
      command = "python3 " + codePath + " < " + inputPath;
    } else {
      const codePath = path.join(dir, "temp.cpp");
      const outPath = path.join(dir, "temp");
      fs.writeFileSync(codePath, code);
      command = "g++ " + codePath + " -o " + outPath + " && " + outPath + " < " + inputPath;
    }
    exec(command, { timeout: 15000 }, (err, stdout, stderr) => {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
      if (err) return reject(stderr || err.message || "Execution error");
      resolve(stdout);
    });
  });
};
