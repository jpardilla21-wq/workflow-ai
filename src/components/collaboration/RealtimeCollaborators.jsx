import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

export default function RealtimeCollaborators({ workflowId }) {
  const [viewers, setViewers] = useState([]);

  useEffect(() => {
    // In a real implementation, this would use WebSocket or Base44's real-time features
    // For now, we'll simulate it
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500'];
    
    // Simulate random viewers joining/leaving
    const interval = setInterval(() => {
      const shouldChange = Math.random() > 0.7;
      if (shouldChange) {
        const numViewers = Math.floor(Math.random() * 3);
        const newViewers = Array.from({ length: numViewers }, (_, i) => ({
          id: `viewer-${i}`,
          initial: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          color: colors[Math.floor(Math.random() * colors.length)]
        }));
        setViewers(newViewers);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [workflowId]);

  if (viewers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <Eye className="w-4 h-4 text-slate-500" />
      <div className="flex -space-x-2">
        {viewers.map((viewer) => (
          <motion.div
            key={viewer.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`w-8 h-8 ${viewer.color} rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white`}
            title="Viewing now"
          >
            {viewer.initial}
          </motion.div>
        ))}
      </div>
      <span className="text-xs text-slate-500">{viewers.length} viewing</span>
    </motion.div>
  );
}