
import React, { useRef, useEffect, useCallback } from 'react';
import { GameStatus, Obstacle, Player, ObstacleType } from '../types';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  PLAYER_SIZE, 
  PLAYER_Y_OFFSET, 
  BASE_SPEED, 
  SPAWN_RATE,
  COLLISION_PADDING,
  COLORS 
} from '../constants';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player>({
    x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
    y: GAME_HEIGHT - PLAYER_Y_OFFSET,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    targetX: GAME_WIDTH / 2 - PLAYER_SIZE / 2
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());

  const spawnObstacle = useCallback(() => {
    const types: ObstacleType[] = ['TREE', 'ROCK', 'SNOWMAN'];
    const type = types[Math.floor(Math.random() * types.length)];
    const width = 30 + Math.random() * 40;
    const height = type === 'TREE' ? 50 + Math.random() * 30 : 30 + Math.random() * 20;
    
    const newObstacle: Obstacle = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_WIDTH - width),
      y: -height,
      width,
      height,
      type
    };
    obstaclesRef.current.push(newObstacle);
  }, []);

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player) => {
    // Skis
    ctx.fillStyle = COLORS.PLAYER_SKIS;
    ctx.fillRect(p.x - 5, p.y + p.height - 5, 10, 20); // Left ski
    ctx.fillRect(p.x + p.width - 5, p.y + p.height - 5, 10, 20); // Right ski

    // Body (Skier)
    ctx.fillStyle = COLORS.PLAYER_BODY;
    ctx.beginPath();
    ctx.moveTo(p.x + p.width / 2, p.y);
    ctx.lineTo(p.x, p.y + p.height - 10);
    ctx.lineTo(p.x + p.width, p.y + p.height - 10);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2, p.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Goggles
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(p.x + p.width / 2 - 5, p.y + 8, 10, 4);
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, o: Obstacle) => {
    if (o.type === 'TREE') {
      // Trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(o.x + o.width / 2 - 5, o.y + o.height - 15, 10, 15);
      // Leaves (Triangle)
      ctx.fillStyle = COLORS.TREE;
      ctx.beginPath();
      ctx.moveTo(o.x + o.width / 2, o.y);
      ctx.lineTo(o.x, o.y + o.height - 10);
      ctx.lineTo(o.x + o.width, o.y + o.height - 10);
      ctx.closePath();
      ctx.fill();
    } else if (o.type === 'SNOWMAN') {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      // Bottom
      ctx.beginPath(); ctx.arc(o.x + o.width / 2, o.y + o.height - 12, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Mid
      ctx.beginPath(); ctx.arc(o.x + o.width / 2, o.y + o.height - 28, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Top
      ctx.beginPath(); ctx.arc(o.x + o.width / 2, o.y + o.height - 40, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else {
      // Rock
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(o.x, o.y + o.height);
      ctx.lineTo(o.x + o.width / 2, o.y);
      ctx.lineTo(o.x + o.width, o.y + o.height);
      ctx.closePath();
      ctx.fill();
    }
  };

  const update = useCallback(() => {
    if (status !== GameStatus.PLAYING) return;

    const p = playerRef.current;
    const speed = BASE_SPEED + (scoreRef.current / 100);

    // Movement
    if (keysPressed.current.has('ArrowLeft')) {
      p.x -= 8;
    }
    if (keysPressed.current.has('ArrowRight')) {
      p.x += 8;
    }

    // Bounds check
    p.x = Math.max(20, Math.min(GAME_WIDTH - PLAYER_SIZE - 20, p.x));

    // Update Obstacles
    obstaclesRef.current.forEach(o => {
      o.y += speed;
    });

    // Cleanup offscreen
    obstaclesRef.current = obstaclesRef.current.filter(o => o.y < GAME_HEIGHT);

    // Spawn new
    if (Math.random() < SPAWN_RATE) {
      spawnObstacle();
    }

    // Collision Check
    const collision = obstaclesRef.current.some(o => {
      return (
        p.x + COLLISION_PADDING < o.x + o.width &&
        p.x + p.width - COLLISION_PADDING > o.x &&
        p.y + COLLISION_PADDING < o.y + o.height &&
        p.y + p.height - COLLISION_PADDING > o.y
      );
    });

    if (collision) {
      onGameOver(Math.floor(scoreRef.current));
      return;
    }

    // Update Score (approx 1 point per second if speed is 5)
    scoreRef.current += 1/60;
    onScoreUpdate(Math.floor(scoreRef.current));

    // Draw
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Background - Snow Lines for speed effect
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        for(let i = 0; i < 10; i++) {
          const lineY = (frameRef.current * speed + i * 100) % GAME_HEIGHT;
          ctx.beginPath();
          ctx.moveTo(20, lineY);
          ctx.lineTo(40, lineY + 20);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(GAME_WIDTH - 20, lineY);
          ctx.lineTo(GAME_WIDTH - 40, lineY + 20);
          ctx.stroke();
        }

        obstaclesRef.current.forEach(o => drawObstacle(ctx, o));
        drawPlayer(ctx, p);
      }
    }

    frameRef.current++;
    requestAnimationFrame(update);
  }, [status, onGameOver, onScoreUpdate, spawnObstacle]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    if (status === GameStatus.PLAYING) {
      scoreRef.current = 0;
      obstaclesRef.current = [];
      playerRef.current.x = GAME_WIDTH / 2 - PLAYER_SIZE / 2;
      requestAnimationFrame(update);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, update]);

  return (
    <div className="relative w-full max-w-[600px] aspect-[3/4] bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-sky-200">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-full"
      />
    </div>
  );
};

export default GameCanvas;
