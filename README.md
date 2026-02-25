# 🗂️ Life Backlog

> A minimal, dark-mode personal backlog tool for tracking life decisions and actions — not just work tasks.

Most task managers are built for projects and sprints. **Life Backlog** is built for the messier, more important decisions: career moves, financial choices, housing, relationships, and everything in between.

![Life Backlog Screenshot](screenshot.png)

---

## ✨ Features

- **Add, edit, delete tasks** with title, context, next action, deadline, priority, and status
- **4 priority levels** — Urgent, High, Medium, Longer Term
- **7 status types** — TO DO, DECISION NEEDED, IN PROGRESS, WAITING, BLOCKED, DONE, BACKLOG
- **Drag to reorder** tasks within your backlog
- **Filter by priority** group
- **Persistent storage** — data saves automatically in your browser (localStorage)
- **Expandable task cards** — click to reveal full context and next action
- **Status summary** — at-a-glance count of all task states
- Example tasks included to get you started

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-handle/life-backlog.git
cd life-backlog
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

---

## 🧠 How to Use It

Think of Life Backlog as a **personal decision board**. Every task should answer:

1. **What** — a clear title (decision or action)
2. **Why / Context** — background, options, blockers
3. **Next Action** — the very next concrete step
4. **Priority** — how urgent is this in your life right now?
5. **Status** — where does it stand?

### Priority Guide

| Priority | Use for |
|----------|---------|
| 🔴 Urgent | Deadline-driven, needs decision now |
| 🟠 High | Important, no hard deadline but shouldn't wait |
| 🟡 Medium | Matters for the next 1–3 months |
| 🟢 Longer Term | Future goals, plant the seed now |

### Status Guide

| Status | Meaning |
|--------|---------|
| `TO DO` | Not started |
| `DECISION NEEDED` | Stuck — requires a choice before moving |
| `IN PROGRESS` | Actively working on it |
| `WAITING` | Depends on someone/something external |
| `BLOCKED` | Blocked by another task |
| `DONE` | Completed ✓ |
| `BACKLOG` | Someday/maybe — not active |

---

## 🛠️ Tech Stack

- [React](https://react.dev/) — UI
- [Vite](https://vitejs.dev/) — build tool
- `localStorage` — persistence (no backend needed)
- Google Fonts — DM Mono + Syne

---

## 🤝 Contributing

Pull requests welcome. Open an issue first for major changes.

---

## 📄 License

MIT — use it, fork it, make it yours.
