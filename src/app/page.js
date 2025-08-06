'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Toaster, toast } from 'sonner'; // Toasts

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [emptyAnimation, setEmptyAnimation] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


  useEffect(() => {
    fetchTodos();
    fetch('/lottie/empty.json')
      .then((res) => res.json())
      .then((data) => setEmptyAnimation(data));
  }, []);

  const fetchTodos = async () => {  
    const res = await fetch(BACKEND_URL);
    const data = await res.json();
    setTodos(data);
  };

  const addTodo = async () => {
    if (!task.trim()) return toast.error('Task cannot be empty!');
    const tempId = Date.now().toString();
    const newTodo = { _id: tempId, task };
    setTodos((prev) => [newTodo, ...prev]);
    setTask('');

    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });

    if (res.ok) {
      fetchTodos();
      toast.success('Task Added');
    } else {
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
      toast.error('Failed to add task');
    }
  };

  const deleteTodo = async (id) => {
    setTodos((prev) => prev.filter((todo) => todo._id !== id));

    const res = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Task Deleted');
    } else {
      fetchTodos();
      toast.error('Failed to delete task');
    }
  };

  const clearAll = async () => {
    for (const todo of todos) {
      await fetch(`${BACKEND_URL}/${todo._id}`, { method: 'DELETE' });
    }
    setTodos([]);
    toast.success('All tasks cleared!');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 overflow-hidden relative">
      <Toaster richColors position="top-right" />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold mb-6 text-gray-800"
      >
        My To-Do
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex gap-2 mb-8 w-full max-w-xl"
      >
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-grow text-gray-700 p-4 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner"
        />
        <button
          onClick={addTodo}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition"
        >
          Add
        </button>
      </motion.div>

      <div className="flex items-center justify-between w-full max-w-xl mb-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 text-md"
        >
          You have {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
        </motion.p>
        {todos.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center mt-10">
          {emptyAnimation && (
            <Lottie animationData={emptyAnimation} loop={true} className="w-72 h-72" />
          )}
          <p className="text-gray-500 text-lg mt-4">No tasks yet. Add one!</p>
        </div>
      ) : (
        <ul className="w-full max-w-xl space-y-4">
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.li
                key={todo._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white/70 backdrop-blur-md flex justify-between items-center p-5 rounded-2xl shadow-xl border border-gray-200 hover:scale-[1.01] transition"
              >
                <span className="text-gray-800 font-medium">{todo.task}</span>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Delete
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </main>
  );
}
