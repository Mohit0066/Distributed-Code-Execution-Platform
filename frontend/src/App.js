import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5001";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [testCases, setTestCases] = useState([{ input: "", expected: "" }]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expected: "" }]);
  };

  const removeTestCase = (index) => {
    const updated = testCases.filter((_, i) => i !== index);
    setTestCases(updated);
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const runCode = async () => {
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      const res = await axios.post(`${API}/run`, {
        code,
        language,
        testCases,
      });

      const jobId = res.data.jobId;
      let attempts = 0;

      const poll = setInterval(async () => {
        attempts++;
        try {
          const outputRes = await axios.get(`${API}/result/${jobId}`);
          const data = outputRes.data;

          if (data.status === "completed") {
            clearInterval(poll);
            setResults(data.result);
            setLoading(false);
          } else if (data.status === "failed") {
            clearInterval(poll);
            setError("Job failed: " + data.error);
            setLoading(false);
          } else if (attempts >= 15) {
            clearInterval(poll);
            setError("Timed out waiting for result.");
            setLoading(false);
          }
        } catch (e) {
          clearInterval(poll);
          setError("Error fetching result.");
          setLoading(false);
        }
      }, 2000);

    } catch (err) {
      setError("Failed to connect to server. Is the backend running?");
      setLoading(false);
    }
  };

  const passCount = results.filter(r => r.result === "PASS").length;
  const failCount = results.filter(r => r.result === "FAIL").length;

  return (
    <div className="container">
      <h1>🚀 Code Execution Platform</h1>

      <div className="grid">

        {/* LEFT */}
        <div className="left">
          <label>Language</label>
          <select onChange={(e) => setLanguage(e.target.value)}>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <textarea
            placeholder="Write your code here..."
            onChange={(e) => setCode(e.target.value)}
          />

          <button onClick={runCode} disabled={loading}>
            {loading ? "Running..." : "▶ Run Code"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="right">

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <label>Test Cases</label>
            <button onClick={addTestCase} style={{ width: "auto", padding: "6px 12px", marginTop: 0 }}>
              + Add
            </button>
          </div>

          {testCases.map((tc, index) => (
            <div className="test-case-box">
              <div className="test-case-header">
                <b style={{ fontSize: "13px" }}>Test Case {index + 1}</b>
                {testCases.length > 1 && (
                  <button
                    onClick={() => removeTestCase(index)}
                    style={{ width: "auto", padding: "2px 8px", marginTop: 0, background: "#ef4444", fontSize: "12px" }}>
                    ✕
                  </button>
                )}
              </div>
              <input
                placeholder="Input"
                value={tc.input}
                onChange={(e) => updateTestCase(index, "input", e.target.value)}
              />
              <input
                placeholder="Expected Output"
                value={tc.expected}
                onChange={(e) => updateTestCase(index, "expected", e.target.value)}
              />
            </div>
          ))}

          <div className="output-box">
            <h3>Results</h3>

            {loading && <p>⏳ Running your code...</p>}
            {error && <p style={{ color: "#ef4444" }}>❌ {error}</p>}

            {results.length > 0 && (
              <>
                <p>
                  <b>Score: </b>
                  <span className="pass">{passCount} PASS</span>
                  {" / "}
                  <span className={failCount > 0 ? "fail" : "pass"}>{failCount} FAIL</span>
                  {" out of "}{results.length}
                </p>
                <hr style={{ borderColor: "#333" }} />
                {results.map((r, i) => (
                  <div key={i} style={{ marginTop: "10px" }}>
                    <p><b>Test {i + 1}:</b> <span className={r.result === "PASS" ? "pass" : "fail"}>{r.result === "PASS" ? "✅ PASS" : "❌ FAIL"}</span></p>
                    <p style={{ fontSize: "13px" }}>Input: {r.input}</p>
                    <p style={{ fontSize: "13px" }}>Expected: {r.expected}</p>
                    <p style={{ fontSize: "13px" }}>Got: {r.output}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;