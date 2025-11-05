import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (jobId) => {
  const [jobProgress, setJobProgress] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    socketRef.current = io(socketUrl);

    socketRef.current.emit('join-job', jobId);

    socketRef.current.on('job-progress', (data) => {
      if (data.jobId === jobId) {
        setJobProgress(data);
      }
    });

    socketRef.current.on('job-completed', (data) => {
      if (data.jobId === jobId) {
        setJobStatus('completed');
      }
    });

    socketRef.current.on('job-failed', (data) => {
      if (data.jobId === jobId) {
        setJobStatus('failed');
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [jobId]);

  return { jobProgress, jobStatus };
};

export default useWebSocket;