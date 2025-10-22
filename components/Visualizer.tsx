
import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyserNode: AnalyserNode | null;
  waveColor: string;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyserNode, waveColor, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyserNode.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgba(15, 23, 42, 0.4)'; // bg-slate-900 with some opacity for trails
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      if(!isPlaying) {
        canvasCtx.clearRect(0,0, canvas.width, canvas.height);
        return;
      }

      canvasCtx.lineWidth = 3;
      canvasCtx.strokeStyle = waveColor || '#ffffff';
      canvasCtx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if(canvasCtx){
        canvasCtx.clearRect(0,0, canvas.width, canvas.height);
      }
    };
  }, [analyserNode, waveColor, isPlaying]);
  
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resizeObserver = new ResizeObserver(() => {
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
        });
        resizeObserver.observe(canvas);
        return () => resizeObserver.disconnect();
    }, []);

  return <canvas ref={canvasRef} className="w-full h-full rounded-lg" />;
};

export default Visualizer;
