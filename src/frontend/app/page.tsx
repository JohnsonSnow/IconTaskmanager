"use client";

import React, { useState, useEffect } from 'react';
import { GripVertical, Plus, Trash2, Calendar, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth-store';

interface Todo {
  id: string;
  description: string;
  status: string;
  labels: string[];
  priority: number;
  dueDate: string;
  userId?: string;
}



export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draggedItem, setDraggedItem] = useState<Todo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState<Todo>({
    id: '',
    description: '',
    dueDate: '',
    labels: [],
    priority: 1,
    status: 'todo'
  });
  const [labelInput, setLabelInput] = useState('');
  const jwt = useAuthStore((state) => state.jwt);
  const userId = useAuthStore((state) => state.userId);


  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5001';
const JWT_TOKEN = jwt || '';

const api = {
  async getTodos(userId: string) {
    const response = await fetch(`${API_BASE_URL}/todos?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  async createTodo(data: Todo): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  async deleteTodo(id: string) {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to delete todo');
  },

  async completeTodo(id: string) {
    const response = await fetch(`${API_BASE_URL}/todos/${id}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to complete todo');
  }
};
  


  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await api.getTodos(userId!);
      setTodos(data || []);
    } catch (error) {
      console.error('Error loading todos:', error);
      setTodos([
        { id: '1', description: 'Design new landing page', status: 'todo', labels: ['design', 'urgent'], priority: 2, dueDate: '2026-01-15' },
        { id: '2', description: 'Implement authentication', status: 'in-progress', labels: ['backend'], priority: 1, dueDate: '2026-01-20' },
        { id: '3', description: 'Write unit tests', status: 'completed', labels: ['testing'], priority: 0, dueDate: '2026-01-10' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, todo: Todo) => {
    setDraggedItem(todo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.status === newStatus) {
      setDraggedItem(null);
      return;
    }

    const updatedTodos = todos.map(todo =>
      todo.id === draggedItem.id ? { ...todo, status: newStatus } : todo
    );
    setTodos(updatedTodos);

    if (newStatus === 'completed') {
      try {
        await api.completeTodo(draggedItem.id);
      } catch (error) {
        console.error('Error completing todo:', error);
        setTodos(todos);
      }
    }

    setDraggedItem(null);
  };

  const handleCreateTodo = async () => {
    if (!newTodo.description.trim()) return;

    const todoData = {
      userId: userId!,
      id: "",
      description: newTodo.description,
      dueDate: newTodo.dueDate,
      labels: newTodo.labels,
      priority: newTodo.priority,
      status: newTodo.status
    };

    try {
      const id = await api.createTodo(todoData);
      const createdTodo = {
        ...todoData,
        id,
        status: 'todo'
      };
      setTodos([...todos, createdTodo]);
      setShowAddModal(false);
      setNewTodo({ id: '', description: '', dueDate: '', labels: [], priority: 1, status: 'todo' });
      setLabelInput('');
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await api.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const addLabel = () => {
    if (labelInput.trim() && !newTodo.labels.includes(labelInput.trim())) {
      setNewTodo({ ...newTodo, labels: [...newTodo.labels, labelInput.trim()] });
      setLabelInput('');
    }
  };

  const removeLabel = (label: string) => {
    setNewTodo({ ...newTodo, labels: newTodo.labels.filter(l => l !== label) });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLabel();
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 2: return 'bg-red-100 text-red-700 border-red-300';
      case 1: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 2: return 'High';
      case 1: return 'Medium';
      default: return 'Low';
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100' }
  ];

   const TodoCard = ({ todo }: { todo: Todo }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, todo)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <GripVertical className="text-gray-400 mt-1 shrink-0" size={16} />
          <p className="text-gray-800 font-medium">{todo.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteTodo(todo.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      
      {todo.dueDate && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <Calendar size={14} />
          <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {todo.labels?.map((label, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
              {label}
            </span>
          ))}
        </div>
        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(todo.priority)}`}>
          {getPriorityLabel(todo.priority)}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-7xl px-6 py-16 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Task Board</h1>
            <p className="text-gray-600 mt-1">Drag and drop to organize your tasks</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>

    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 min-h-[500px]"
            >
              <div className={`${column.color} rounded-lg px-4 py-3 mb-4`}>
                <h2 className="font-semibold text-gray-800 flex items-center justify-between">
                  {column.title}
                  <span className="bg-white px-2 py-1 rounded-full text-sm">
                    {todos.filter(t => t.status === column.id).length}
                  </span>
                </h2>
              </div>
              <div className="min-h-100">
                {todos
                  .filter(todo => todo.status === column.id)
                  .map(todo => (
                    <TodoCard key={todo.id} todo={todo} />
                  ))}
              </div>
            </div>
          ))}
        </div>

          {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Task</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Description</label>
              <Textarea
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Due Date</label>
              <Input
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Priority</label>
              <Select
                value={newTodo.priority.toString()}
                onValueChange={(value) =>
                  setNewTodo({ ...newTodo, priority: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">Low</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">High</SelectItem>
                  <SelectItem value="4">Top</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Labels</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add label"
                />
                <Button
                  onClick={addLabel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Tag size={20} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newTodo.labels.map((label, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200 flex items-center gap-1">
                    {label}
                    <Button onClick={() => removeLabel(label)} className="ml-1 hover:text-blue-900">
                      <X size={14} />
                    </Button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTodo({ id: '', description: '', dueDate: '', labels: [], priority: 1, status: 'todo' });
                  setLabelInput('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTodo}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
