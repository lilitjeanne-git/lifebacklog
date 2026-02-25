import { useState, useEffect, useRef } from "react";

const PRIORITIES = [
  { key: "urgent", label: "🔴 Urgent", color: "#ff4d4d", bg: "rgba(255,77,77,0.08)", border: "rgba(255,77,77,0.3)" },
  { key: "high", label: "🟠 High Priority", color: "#ff8c42", bg: "rgba(255,140,66,0.08)", border: "rgba(255,140,66,0.3)" },
  { key: "medium", label: "🟡 Medium Term", color: "#f5c842", bg: "rgba(245,200,66,0.08)", border: "rgba(245,200,66,0.3)" },
  { key: "longterm", label: "🟢 Longer Term", color: "#4caf7d", bg: "rgba(76,175,125,0.08)", border: "rgba(76,175,125,0.3)" },
];

const STATUSES = ["TO DO", "DECISION NEEDED", "IN PROGRESS", "WAITING", "BLOCKED", "DONE", "BACKLOG"];

const STATUS_COLORS = {
  "DECISION NEEDED": { bg: "#3a1a1a", text: "#ff6b6b", border: "#ff4d4d" },
  "BLOCKED":         { bg: "#2a1a2e", text: "#c77dff", border: "#9b5de5" },
  "WAITING":         { bg: "#1a2a3a", text: "#63b3ed", border: "#3182ce" },
  "TO DO":           { bg: "#1a2a1a", text: "#68d391", border: "#38a169" },
  "IN PROGRESS":     { bg: "#2a2a1a", text: "#f6e05e", border: "#d69e2e" },
  "BACKLOG":         { bg: "#1a1a2a", text: "#a0aec0", border: "#4a5568" },
  "DONE":            { bg: "#1a2a1a", text: "#4caf7d", border: "#2d7a57" },
};

const EXAMPLE_TASKS = [
  {
    id: "1",
    priority: "urgent",
    title: "Decide: Accept job offer or keep searching",
    status: "DECISION NEEDED",
    deadline: "This Friday",
    details: "Received offer from Company X. Salary is 10% below target but role is interesting. Counter-offer possible.",
    action: "Calculate minimum acceptable salary and send counter-offer by Thursday.",
  },
  {
    id: "2",
    priority: "urgent",
    title: "Renew apartment lease",
    status: "TO DO",
    deadline: "End of month",
    details: "Lease expires in 6 weeks. Landlord wants decision by end of month. Alternative: find new place.",
    action: "Call landlord and confirm intention or start flat search.",
  },
  {
    id: "3",
    priority: "high",
    title: "Sort health insurance plan",
    status: "WAITING",
    deadline: null,
    details: "Open enrollment ends soon. Need to compare current plan vs new options. Waiting for employer HR doc.",
    action: "Follow up with HR, then compare plans on government portal.",
  },
  {
    id: "4",
    priority: "medium",
    title: "Learn a new skill (language / coding / design)",
    status: "IN PROGRESS",
    deadline: null,
    details: "Started Spanish on Duolingo 3 weeks ago. Consistency is the challenge. 15 min/day goal.",
    action: "Block daily 15-min slot in calendar. Review progress at end of month.",
  },
  {
    id: "5",
    priority: "longterm",
    title: "Buy property",
    status: "BACKLOG",
    deadline: null,
    details: "Long-term goal. Need stable income and 20% down payment first. Market research ongoing.",
    action: "Open dedicated savings account. Set monthly savings target.",
  },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const STORAGE_KEY = "life-backlog-v1";

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return EXAMPLE_TASKS;
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

function Modal({ task, onSave, onClose }) {
  const [form, setForm] = useState(
    task || { priority: "high", title: "", status: "TO DO", deadline: "", details: "", action: "" }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#13131f", border: "1px solid #2d2d44", borderRadius: 12,
        padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
        fontFamily: "'DM Mono', monospace",
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a5568", marginBottom: 20 }}>
          {task ? "EDIT TASK" : "NEW TASK"}
        </div>

        {[
          { label: "TITLE", key: "title", type: "text", placeholder: "What needs to be decided or done?" },
          { label: "DEADLINE", key: "deadline", type: "text", placeholder: "e.g. End of month, March 4th…" },
          { label: "CONTEXT", key: "details", type: "textarea", placeholder: "Background, options, blockers…" },
          { label: "NEXT ACTION", key: "action", type: "textarea", placeholder: "The very next concrete step…" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a5568", marginBottom: 6 }}>{label}</div>
            {type === "textarea" ? (
              <textarea
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                rows={3}
                style={{
                  width: "100%", background: "#0d0d14", border: "1px solid #2d2d44",
                  borderRadius: 6, padding: "10px 12px", color: "#e2e8f0",
                  fontFamily: "inherit", fontSize: 12, resize: "vertical", outline: "none",
                }}
              />
            ) : (
              <input
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%", background: "#0d0d14", border: "1px solid #2d2d44",
                  borderRadius: 6, padding: "10px 12px", color: "#e2e8f0",
                  fontFamily: "inherit", fontSize: 12, outline: "none",
                }}
              />
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a5568", marginBottom: 6 }}>PRIORITY</div>
            <select value={form.priority} onChange={e => set("priority", e.target.value)} style={{
              width: "100%", background: "#0d0d14", border: "1px solid #2d2d44",
              borderRadius: 6, padding: "10px 12px", color: "#e2e8f0",
              fontFamily: "inherit", fontSize: 12, outline: "none",
            }}>
              {PRIORITIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a5568", marginBottom: 6 }}>STATUS</div>
            <select value={form.status} onChange={e => set("status", e.target.value)} style={{
              width: "100%", background: "#0d0d14", border: "1px solid #2d2d44",
              borderRadius: 6, padding: "10px 12px", color: "#e2e8f0",
              fontFamily: "inherit", fontSize: 12, outline: "none",
            }}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{
            padding: "8px 18px", borderRadius: 6, background: "transparent",
            border: "1px solid #2d2d44", color: "#718096", fontFamily: "inherit",
            fontSize: 11, cursor: "pointer", letterSpacing: 1,
          }}>CANCEL</button>
          <button onClick={() => form.title.trim() && onSave(form)} style={{
            padding: "8px 18px", borderRadius: 6, background: "#e2e8f0",
            border: "none", color: "#0d0d14", fontFamily: "inherit",
            fontSize: 11, cursor: "pointer", fontWeight: 700, letterSpacing: 1,
          }}>SAVE</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null); // null | "new" | task object
  const [dragId, setDragId] = useState(null);
  const dragOver = useRef(null);

  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const saveTask = (form) => {
    if (modal === "new") {
      setTasks(t => [...t, { ...form, id: generateId() }]);
    } else {
      setTasks(t => t.map(x => x.id === form.id ? form : x));
    }
    setModal(null);
  };

  const deleteTask = (id) => {
    if (confirm("Delete this task?")) setTasks(t => t.filter(x => x.id !== id));
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.priority === filter);

  // Drag handlers
  const onDragStart = (id) => setDragId(id);
  const onDragEnter = (id) => { dragOver.current = id; };
  const onDragEnd = () => {
    if (!dragId || !dragOver.current || dragId === dragOver.current) { setDragId(null); return; }
    setTasks(prev => {
      const arr = [...prev];
      const from = arr.findIndex(t => t.id === dragId);
      const to = arr.findIndex(t => t.id === dragOver.current);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragId(null);
    dragOver.current = null;
  };

  const statusCounts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d14",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      padding: "40px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .task-card { transition: transform 0.15s ease, border-color 0.15s ease; }
        .task-card:hover .task-actions { opacity: 1 !important; }
        .task-card.dragging { opacity: 0.4; }
        .task-card.drag-over { border-top: 2px solid #e2e8f0 !important; }
        button, select, input, textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #2d2d44; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #2d2d44; }
        select option { background: #13131f; }
      `}</style>

      {modal && (
        <Modal
          task={modal === "new" ? null : modal}
          onSave={saveTask}
          onClose={() => setModal(null)}
        />
      )}

      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#4a5568", marginBottom: 6 }}>PERSONAL DECISION TOOL</div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 5vw, 42px)",
              fontWeight: 800, margin: 0,
              background: "linear-gradient(135deg, #e2e8f0 0%, #4a5568 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-1px",
            }}>LIFE BACKLOG</h1>
            <div style={{ fontSize: 11, color: "#4a5568", marginTop: 4 }}>
              {tasks.length} tasks · drag to reorder
            </div>
          </div>
          <button onClick={() => setModal("new")} style={{
            padding: "10px 20px", borderRadius: 8,
            background: "#e2e8f0", border: "none", color: "#0d0d14",
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer",
          }}>+ NEW TASK</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {[["all", "All", "#718096"], ...PRIORITIES.map(p => [p.key, p.label, p.color])].map(([key, label, color]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 10, letterSpacing: 1,
              background: filter === key ? color : "transparent",
              color: filter === key ? "#0d0d14" : color,
              border: `1px solid ${color}`, fontWeight: filter === key ? 700 : 400, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>

        {/* Groups */}
        {PRIORITIES.map(p => {
          const group = filtered.filter(t => t.priority === p.key);
          if (!group.length) return null;
          return (
            <div key={p.key} style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: p.color, textTransform: "uppercase", marginBottom: 10 }}>
                {p.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {group.map(task => {
                  const sc = STATUS_COLORS[task.status] || STATUS_COLORS["TO DO"];
                  const isOpen = expanded[task.id];
                  const isDragging = dragId === task.id;
                  return (
                    <div
                      key={task.id}
                      className={`task-card${isDragging ? " dragging" : ""}`}
                      draggable
                      onDragStart={() => onDragStart(task.id)}
                      onDragEnter={() => onDragEnter(task.id)}
                      onDragEnd={onDragEnd}
                      onDragOver={e => e.preventDefault()}
                      style={{
                        background: "#13131f",
                        border: `1px solid ${isOpen ? p.border : "#1e1e2e"}`,
                        borderLeft: `3px solid ${p.color}`,
                        borderRadius: 8,
                        padding: "12px 16px",
                        cursor: "grab",
                      }}
                    >
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ color: "#2d2d44", fontSize: 14, cursor: "grab" }}>⠿</span>

                        <span style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 9, letterSpacing: 1.5,
                          fontWeight: 600, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                          whiteSpace: "nowrap",
                        }}>{task.status}</span>

                        <span
                          onClick={() => toggle(task.id)}
                          style={{ fontSize: 13, flex: 1, color: "#e2e8f0", cursor: "pointer" }}
                        >{task.title}</span>

                        {task.deadline && (
                          <span style={{ fontSize: 10, color: "#ff6b6b", whiteSpace: "nowrap" }}>⏰ {task.deadline}</span>
                        )}

                        {/* Actions */}
                        <div className="task-actions" style={{ display: "flex", gap: 6, opacity: 0, transition: "opacity 0.15s" }}>
                          <button onClick={() => setModal(task)} style={{
                            background: "transparent", border: "1px solid #2d2d44", borderRadius: 4,
                            padding: "3px 8px", color: "#718096", fontSize: 10, cursor: "pointer",
                          }}>edit</button>
                          <button onClick={() => deleteTask(task.id)} style={{
                            background: "transparent", border: "1px solid #3a1a1a", borderRadius: 4,
                            padding: "3px 8px", color: "#ff4d4d", fontSize: 10, cursor: "pointer",
                          }}>del</button>
                        </div>

                        <span
                          onClick={() => toggle(task.id)}
                          style={{ color: "#4a5568", fontSize: 13, cursor: "pointer",
                            display: "inline-block", transition: "transform 0.2s",
                            transform: isOpen ? "rotate(90deg)" : "none" }}
                        >›</span>
                      </div>

                      {/* Expanded */}
                      {isOpen && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e1e2e", display: "flex", flexDirection: "column", gap: 10 }}>
                          {task.details && (
                            <div>
                              <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a5568", marginBottom: 4 }}>CONTEXT</div>
                              <div style={{ fontSize: 12, color: "#a0aec0", lineHeight: 1.7, whiteSpace: "pre-line" }}>{task.details}</div>
                            </div>
                          )}
                          {task.action && (
                            <div>
                              <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a5568", marginBottom: 4 }}>NEXT ACTION</div>
                              <div style={{ fontSize: 12, color: p.color, lineHeight: 1.6 }}>→ {task.action}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#2d2d44", padding: "60px 0", fontSize: 13 }}>
            No tasks yet. Add your first task ↑
          </div>
        )}

        {/* Status summary */}
        {tasks.length > 0 && (
          <div style={{
            marginTop: 40, padding: "14px 18px", background: "#13131f",
            borderRadius: 8, border: "1px solid #1e1e2e",
            display: "flex", gap: 20, flexWrap: "wrap",
          }}>
            {Object.entries(statusCounts).map(([status, count]) => {
              const sc = STATUS_COLORS[status] || STATUS_COLORS["TO DO"];
              return (
                <div key={status} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.border, display: "inline-block" }} />
                  <span style={{ fontSize: 10, color: "#718096" }}>{status}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: sc.text }}>{count}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 24, fontSize: 10, color: "#2d2d44", textAlign: "center" }}>
          data saved in your browser · github.com/your-handle/life-backlog
        </div>
      </div>
    </div>
  );
}
