<h1 align="center">⚔️ Computer Agent Arena</h1>

<h3 align="center">Toward Human-Centric Evaluation and Analysis of Computer-Use Agents</h3>

<p align="center">
  🌐 <a href="https://arena.xlang.ai">Website</a> &nbsp;|&nbsp;
  📑 <a href="#">Paper (ICLR 2026)</a> &nbsp;|&nbsp;
  🏆 <a href="https://arena.xlang.ai/leaderboard">Leaderboard</a> &nbsp;|&nbsp;
  📝 <a href="https://arena.xlang.ai/blog/computer-agent-arena">Blog</a> &nbsp;|&nbsp;
  🤝 <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ICLR-2026-red.svg" alt="ICLR 2026">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.8+-blue.svg" alt="Python"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-16+-green.svg" alt="Node"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg" alt="Contributions"></a>
</p>

---

## Introduction

**Computer Agent Arena** is an open, crowdsourced evaluation platform for benchmarking computer-use agents (CUAs) on real-world tasks. Users interact with two AI agents side-by-side on live desktop environments (Ubuntu / Windows) and vote for the better one — producing human preference data at scale that powers a continuously updated ELO leaderboard.

This repository releases the **full platform stack**: backend server, frontend UI, agent hub, and deployment infrastructure.

---

## Platform Overview

- **Frontend** (React 18 + TypeScript): Dual-agent chat panel, live VNC desktop viewer, leaderboard
- **Backend** (Flask + Socket.IO): User sessions, VM pool orchestration, agent execution, and evaluation
- **Agent Hub**: Pluggable implementations for 10+ frontier models
- **Infrastructure**: AWS EC2 multi-region VM pool (Ubuntu / Windows) with adaptive auto-scaling

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Ant Design, Tailwind CSS, Socket.IO |
| Backend | Python, Flask, Flask-SocketIO |
| Database | PostgreSQL, Redis |
| Infrastructure | AWS EC2 (multi-region), S3 |
| Auth | Google OAuth 2.0, JWT, Anonymous access, Prolific |

---

## Supported Agents

| Model | Organization |
|-------|-------------|
| GPT-4.1, GPT-5 | OpenAI |
| Computer-Use-Preview | OpenAI |
| Claude 3.7 / 4 Sonnet, Claude Sonnet 4.5 | Anthropic |
| Gemini 2.5 Pro | Google |
| Qwen2.5-VL-72B | Alibaba |
| UI-TARS-1.5 | ByteDance |
| OpenCUA | XLang Lab |
| CoAct | — |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+, Node.js 16+
- PostgreSQL, Redis
- AWS account (for VM pool) **or** local VMware / VirtualBox

### 1. Clone

```bash
git clone https://github.com/xlang-ai/computer-agent-arena.git
cd computer-agent-arena
```

### 2. Backend

```bash
pip install -r backend/requirements.txt
```

Create a `.env` file with your database, Redis, AWS, API keys, and auth credentials. Configure `config.yaml`:

```yaml
deployment: local   # or 'aws'
```

Start the server:

```bash
python -m backend.main   # listens on :8181
```

### 3. Frontend

```bash
cd frontend
npm install
npm start   # dev server on :3000
```

---

## Adding a New Agent

1. Create `backend/agents/hub/YourAgent/` and implement a class extending `BaseAgent`.
2. Register the model and method name in `config.yaml` under `AVAILABLE_AGENT_OPTIONS`.
3. Test with `python backend/agents/test/test_agents.py`.

See existing implementations in `backend/agents/hub/` (Anthropic, OpenAICUA, UI_TARS, OpenCUA, coact) for reference.

---

## Repository Structure

```
computer-agent-arena/
├── backend/
│   ├── main.py              # Entry point
│   ├── agents/              # Agent hub + base classes
│   │   └── hub/             # Per-model implementations
│   ├── api/                 # WebSocket / REST handlers
│   ├── desktop_env/         # VM abstraction (AWS, VMware, ...)
│   └── utils/               # DB, S3, socket utilities
├── frontend/                # React 18 + TypeScript UI
│   └── src/
└── config.yaml              # Deployment configuration
```

---

## Citation

```bibtex
@inproceedings{wang2026computeragentarena,
  title     = {Computer Agent Arena: Toward Human-Centric Evaluation and Analysis of Computer-Use Agents},
  author    = {Wang, Bowen and others},
  booktitle = {The Fourteenth International Conference on Learning Representations (ICLR)},
  year      = {2026},
  url       = {https://arena.xlang.ai}
}
```

---

## Contributing

We welcome new agent integrations and platform improvements. See [CONTRIBUTING.md](CONTRIBUTING.md) or contact us at [bryanwang.nlp@gmail.com](mailto:bryanwang.nlp@gmail.com).

---

## License

MIT License — see [LICENSE](LICENSE) for details.
