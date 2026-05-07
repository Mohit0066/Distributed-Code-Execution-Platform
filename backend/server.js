const express = require("express");
const cors = require("cors");
const codeQueue = require("./queue");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", async (req, res) => {
  try {
    const job = await codeQueue.add(req.body);
    res.json({ jobId: job.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to add job" });
  }
});

app.get("/result/:id", async (req, res) => {
  try {
    const job = await codeQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: "No job found" });

    const state = await job.getState();

    if (state === "completed") {
      return res.json({ status: "completed", result: job.returnvalue });
    } else if (state === "failed") {
      return res.json({ status: "failed", error: job.failedReason });
    } else {
      return res.json({ status: state });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to get job result" });
  }
});

app.listen(5001, () => console.log("Server running on http://localhost:5001"));
