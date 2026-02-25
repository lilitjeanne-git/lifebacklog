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
  { id: "1", priority: "urgent", title: "Decide: Accept job offer or keep searching", status: "DECISION NEEDED", deadline: "This Friday", details: "Received offer from Company X. Salary is 10% below target but role is interesting. Counter-offer possible.", action: "Calculate minimum acceptable salary and send counter-offer by Thursday." },
  { id: "2", priority: "urgent", title: "Renew apartment lease", status: "TO DO", deadline: "End of month", details: "Lease expires in 6 weeks. Landlord wants decision by end of month. Alternative: find new place.", action: "Call landlord and confirm intention or start flat search." },
  { id: "3", priority: "high", title: "Sort health insurance plan", status: "WAITING", deadline: null, details: "Open enrollment ends soon. Need to compare current plan vs new options. Waiting for employer HR doc.", action: "Follow up with HR, then compare plans on government portal." },
  { id: "4", priority: "medium", title: "Learn a new skill (language / coding / design)", status: "IN PROGRESS", deadline: null, details: "Started Spanish on Duolingo 3 weeks ago. Consistency is the challenge. 15 min/day goal.", action: "Block daily 15-min slot in calendar. Review progress at end of month." },
  { id: "5", priority: "longterm", title: "Buy property", status: "BACKLOG", deadline: null, details: "Long-term goal. Need stable income and 20% down payment first. Market research ongoing.", action: "Open dedicated savings account. Set monthly savings target." },
];

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const STORAGE_KEY = "life-backlog-v1";
function loadTasks() {
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch {}
  return EXAMPLE_TASKS;
}
function saveTasks(t) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch {} }

function Modal({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || { priority: "high", title: "", status: "TO DO", deadline: "", details: "", action: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = { width: "100%", background: "#0d0d14", border: "1px solid #2d2d44", borderRadius: 6, padding: "9px 12px", color: "#e2e8f0", fontFamily: "inherit", fontSize: 12, outline: "none" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#13131f", border: "1px solid #2d2d44", borderRadius: 12, padding: 24, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", fontFamily: "'DM Mono',monospace" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a5568", marginBottom: 18 }}>{task ? "EDIT TASK" : "NEW TASK"}</div>
        {[["TITLE","title","text","What needs to be decided or done?"],["DEADLINE","deadline","text","e.g. End of month, This Friday…"],["CONTEXT","details","textarea","Background, options, blockers…"],["NEXT ACTION","action","textarea","The very next concrete step…"]].map(([label,key,type,ph]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a5568", marginBottom: 5 }}>{label}</div>
            {type === "textarea" ? <textarea value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} rows={3} style={{ ...inp, resize: "vertical" }} /> : <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} style={inp} />}
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          {[["PRIORITY","priority",PRIORITIES.map(p=>[p.key,p.label])],["STATUS","status",STATUSES.map(s=>[s,s])]].map(([label,key,opts]) => (
            <div key={key} style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a5568", marginBottom: 5 }}>{label}</div>
              <select value={form[key]} onChange={e => set(key, e.target.value)} style={inp}>
                {opts.map(([val,lbl]) => <option key={val} value={val}>{lbl}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 6, background: "transparent", border: "1px solid #2d2d44", color: "#718096", fontFamily: "inherit", fontSize: 10, cursor: "pointer", letterSpacing: 1 }}>CANCEL</button>
          <button onClick={() => form.title.trim() && onSave(form)} style={{ padding: "7px 16px", borderRadius: 6, background: "#e2e8f0", border: "none", color: "#0d0d14", fontFamily: "inherit", fontSize: 10, cursor: "pointer", fontWeight: 700, letterSpacing: 1 }}>SAVE</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const saveTask = form => {
    if (modal === "new") setTasks(t => [...t, { ...form, id: generateId() }]);
    else setTasks(t => t.map(x => x.id === form.id ? form : x));
    setModal(null);
  };
  const deleteTask = id => { if (window.confirm("Delete this task?")) setTasks(t => t.filter(x => x.id !== id)); };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.priority === filter);
  const statusCounts = tasks.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});
  const draggedTask = tasks.find(t => t.id === dragId);

  const onDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnd = () => {
    if (dragId && dropTarget) {
      if (dropTarget.type === "priority") {
        setTasks(prev => prev.map(t => t.id === dragId ? { ...t, priority: dropTarget.key } : t));
      } else if (dropTarget.type === "task") {
        setTasks(prev => {
          const arr = [...prev];
          const from = arr.findIndex(t => t.id === dragId);
          const to = arr.findIndex(t => t.id === dropTarget.id);
          if (from !== -1 && to !== -1) { const [item] = arr.splice(from, 1); arr.splice(to, 0, item); }
          return arr;
        });
      }
    }
    setDragId(null);
    setDropTarget(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d14", fontFamily: "'DM Mono','Courier New',monospace", color: "#e2e8f0", padding: "36px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .tc:hover .ta { opacity: 1 !important; }
        input::placeholder,textarea::placeholder { color: #2d2d44; }
        select option { background: #13131f; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #2d2d44; border-radius: 3px; }
      `}</style>

      {modal && <Modal task={modal === "new" ? null : modal} onSave={saveTask} onClose={() => setModal(null)} />}

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#4a5568", marginBottom: 4 }}>PERSONAL DECISION TOOL</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px,5vw,40px)", fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#e2e8f0,#4a5568)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>LIFE BACKLOG</h1>
            <div style={{ fontSize: 10, color: "#4a5568", marginTop: 3 }}>{tasks.length} tasks · drag tasks between priority groups to reprioritize</div>
          </div>
          <button onClick={() => setModal("new")} style={{ padding: "9px 18px", borderRadius: 8, background: "#e2e8f0", border: "none", color: "#0d0d14", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer", fontFamily: "inherit" }}>+ NEW TASK</button>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 28 }}>
          {[["all","All","#718096"], ...PRIORITIES.map(p => [p.key, p.label, p.color])].map(([key, label, color]) => (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, letterSpacing: 1, background: filter === key ? color : "transparent", color: filter === key ? "#0d0d14" : color, border: `1px solid ${color}`, fontWeight: filter === key ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
          ))}
        </div>

        {PRIORITIES.map(p => {
          const group = filtered.filter(t => t.priority === p.key);
          const isDropZone = dropTarget?.type === "priority" && dropTarget?.key === p.key && draggedTask?.priority !== p.key;

          return (
            <div key={p.key} style={{ marginBottom: 28 }}>
              <div
                onDragOver={e => { e.preventDefault(); setDropTarget({ type: "priority", key: p.key }); }}
                onDragLeave={() => setDropTarget(dt => dt?.type === "priority" && dt?.key === p.key ? null : dt)}
                style={{
                  fontSize: 9, letterSpacing: 3, color: p.color, marginBottom: 8,
                  padding: "6px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 8,
                  background: isDropZone ? p.bg : "transparent",
                  border: isDropZone ? `1px dashed ${p.color}` : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {p.label}
                {isDropZone && <span style={{ fontSize: 9, opacity: 0.8 }}>← drop to move here</span>}
              </div>

              {group.length === 0 && (
                <div
                  onDragOver={e => { e.preventDefault(); setDropTarget({ type: "priority", key: p.key }); }}
                  onDragLeave={() => setDropTarget(null)}
                  style={{
                    height: 44, borderRadius: 8,
                    border: `1px dashed ${isDropZone ? p.color : "#1e1e2e"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: isDropZone ? p.color : "#2d2d44",
                    background: isDropZone ? p.bg : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {dragId ? "drop here to reprioritize" : "no tasks"}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {group.map(task => {
                  const sc = STATUS_COLORS[task.status] || STATUS_COLORS["TO DO"];
                  const isOpen = expanded[task.id];
                  const isDragging = dragId === task.id;
                  const isTaskDrop = dropTarget?.type === "task" && dropTarget?.id === task.id && dragId !== task.id;

                  return (
                    <div key={task.id} className="tc" draggable
                      onDragStart={e => onDragStart(e, task.id)}
                      onDragEnd={onDragEnd}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDropTarget({ type: "task", id: task.id }); }}
                      onDragLeave={() => setDropTarget(dt => dt?.type === "task" && dt?.id === task.id ? null : dt)}
                      style={{
                        background: "#13131f",
                        border: `1px solid ${isTaskDrop ? p.color : isOpen ? p.border : "#1e1e2e"}`,
                        borderLeft: `3px solid ${p.color}`,
                        borderRadius: 8, padding: "11px 14px",
                        opacity: isDragging ? 0.35 : 1,
                        transform: isTaskDrop ? "translateX(5px)" : "none",
                        transition: "transform 0.1s, border-color 0.1s, opacity 0.15s",
                        cursor: "grab",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ color: "#2d2d44", fontSize: 13, userSelect: "none" }}>⠿</span>
                        <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 8, letterSpacing: 1.5, fontWeight: 600, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, whiteSpace: "nowrap" }}>{task.status}</span>
                        <span onClick={() => toggle(task.id)} style={{ fontSize: 12, flex: 1, color: "#e2e8f0", cursor: "pointer" }}>{task.title}</span>
                        {task.deadline && <span style={{ fontSize: 10, color: "#ff6b6b", whiteSpace: "nowrap" }}>⏰ {task.deadline}</span>}
                        <div className="ta" style={{ display: "flex", gap: 5, opacity: 0, transition: "opacity 0.15s" }}>
                          <button onClick={e => { e.stopPropagation(); setModal(task); }} style={{ background: "transparent", border: "1px solid #2d2d44", borderRadius: 4, padding: "2px 7px", color: "#718096", fontSize: 9, cursor: "pointer", fontFamily: "inherit" }}>edit</button>
                          <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }} style={{ background: "transparent", border: "1px solid #3a1a1a", borderRadius: 4, padding: "2px 7px", color: "#ff4d4d", fontSize: 9, cursor: "pointer", fontFamily: "inherit" }}>del</button>
                        </div>
                        <span onClick={() => toggle(task.id)} style={{ color: "#4a5568", fontSize: 13, cursor: "pointer", display: "inline-block", transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>
                      </div>
                      {isOpen && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e1e2e", display: "flex", flexDirection: "column", gap: 8 }}>
                          {task.details && <div><div style={{ fontSize: 8, letterSpacing: 2, color: "#4a5568", marginBottom: 3 }}>CONTEXT</div><div style={{ fontSize: 11, color: "#a0aec0", lineHeight: 1.7, whiteSpace: "pre-line" }}>{task.details}</div></div>}
                          {task.action && <div><div style={{ fontSize: 8, letterSpacing: 2, color: "#4a5568", marginBottom: 3 }}>NEXT ACTION</div><div style={{ fontSize: 11, color: p.color, lineHeight: 1.6 }}>→ {task.action}</div></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !dragId && (
          <div style={{ textAlign: "center", color: "#2d2d44", padding: "50px 0", fontSize: 12 }}>No tasks yet — add your first one ↑</div>
        )}

        {tasks.length > 0 && (
          <div style={{ marginTop: 32, padding: "12px 16px", background: "#13131f", borderRadius: 8, border: "1px solid #1e1e2e", display: "flex", gap: 18, flexWrap: "wrap" }}>
            {Object.entries(statusCounts).map(([status, count]) => {
              const sc = STATUS_COLORS[status] || STATUS_COLORS["TO DO"];
              return <div key={status} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.border, display: "inline-block" }} /><span style={{ fontSize: 9, color: "#718096" }}>{status}</span><span style={{ fontSize: 10, fontWeight: 600, color: sc.text }}>{count}</span></div>;
            })}
          </div>
        )}
        <div style={{ marginTop: 24, fontSize: 10, color: "#2d2d44", textAlign: "center" }}>
          data saved in your browser · github.com/lilitjeanne-git/life-backlog
        </div>
      </div>
    </div>
  );
}
