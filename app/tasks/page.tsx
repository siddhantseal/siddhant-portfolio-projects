"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { starterTasks, type Task } from "@/lib/data";

const lanes: Task["status"][] = ["Backlog", "Active", "Review", "Done"];
const storageKey = "siddhant-task-board";

function nowLabel() {
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("Siddhant");
  const [filter, setFilter] = useState("All");
  const [syncMessage, setSyncMessage] = useState("Local workspace ready");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) setTasks(JSON.parse(stored) as Task[]);

    const channel = new BroadcastChannel("task-board-sync");
    channel.onmessage = (event) => {
      setTasks(event.data as Task[]);
      setSyncMessage("Synced from another tab");
    };

    return () => channel.close();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    return filter === "All" ? tasks : tasks.filter((task) => task.priority === filter);
  }, [filter, tasks]);

  function publish(nextTasks: Task[]) {
    setTasks(nextTasks);
    window.localStorage.setItem(storageKey, JSON.stringify(nextTasks));
    const channel = new BroadcastChannel("task-board-sync");
    channel.postMessage(nextTasks);
    channel.close();
    setSyncMessage("Synced to workspace");
  }

  function moveTask(id: string, status: Task["status"]) {
    publish(tasks.map((task) => (task.id === id ? { ...task, status, updatedAt: nowLabel() } : task)));
  }

  function addTask() {
    if (!title.trim()) return;
    publish([
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        owner: owner.trim() || "Team",
        priority: "Medium",
        status: "Backlog",
        updatedAt: nowLabel()
      },
      ...tasks
    ]);
    setTitle("");
  }

  function changePriority(id: string) {
    const order: Task["priority"][] = ["Low", "Medium", "High"];
    publish(
      tasks.map((task) => {
        if (task.id !== id) return task;
        const nextPriority = order[(order.indexOf(task.priority) + 1) % order.length];
        return { ...task, priority: nextPriority, updatedAt: nowLabel() };
      })
    );
  }

  return (
    <main className="shell">
      <nav className="topNav">
        <Link href="/">Projects</Link>
        <span>Collaborative Task Manager</span>
      </nav>

      <section className="taskHero">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Team task board with live collaboration behavior.</h1>
          <p>
            Add work, move tasks across lanes, update priority, and open another browser tab to see
            changes broadcast through the local collaboration channel.
          </p>
        </div>
        <div className="syncPanel">
          <span>Realtime status</span>
          <strong>{syncMessage}</strong>
          <small>Socket.io server code included in repository</small>
        </div>
      </section>

      <section className="taskControls">
        <input
          aria-label="Task title"
          placeholder="Create a task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          aria-label="Task owner"
          placeholder="Owner"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        />
        <button className="button primary" onClick={addTask} type="button">Add task</button>
        <select aria-label="Filter by priority" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </section>

      <section className="board" aria-label="Task board">
        {lanes.map((lane) => {
          const laneTasks = visibleTasks.filter((task) => task.status === lane);
          return (
            <div className="lane" key={lane}>
              <header>
                <h2>{lane}</h2>
                <span>{laneTasks.length}</span>
              </header>
              <div className="taskList">
                {laneTasks.map((task) => (
                  <article className="taskCard" key={task.id}>
                    <div className="taskCardTop">
                      <strong>{task.title}</strong>
                      <button onClick={() => changePriority(task.id)} type="button">{task.priority}</button>
                    </div>
                    <p>{task.owner}</p>
                    <small>Updated {task.updatedAt}</small>
                    <div className="taskMoves">
                      {lanes.map((target) => (
                        <button
                          disabled={target === task.status}
                          key={target}
                          onClick={() => moveTask(task.id, target)}
                          type="button"
                        >
                          {target}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
