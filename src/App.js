import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const difficultyConfig = {
  简单: { speed: 200, gridSize: 30 },
  中等: { speed: 160, gridSize: 35 },
  困难: { speed: 120, gridSize: 40 },
  地狱: { speed: 80, gridSize: 45 },
};

function App() {
  const [currentDifficulty, setCurrentDifficulty] = useState("简单");
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [food, setFood] = useState({
    x: Math.floor(difficultyConfig["简单"].gridSize / 4),
    y: Math.floor(difficultyConfig["简单"].gridSize / 4),
  });
  const [snake, setSnake] = useState([
    {
      x: 10,
      y: 10,
    },
  ]);

  const directionRef = useRef({ x: 0, y: 1 });
  const gameContainerRef = useRef(null);

  const resetGame = () => {
    setGameOver(false);
    directionRef.current = { x: 0, y: 1 };
    setSnake([
      {
        x: Math.floor(difficultyConfig[currentDifficulty].gridSize / 2),
        y: Math.floor(difficultyConfig[currentDifficulty].gridSize / 2),
      },
    ]);
    setFood({
      x: Math.floor(difficultyConfig[currentDifficulty].gridSize / 4),
      y: Math.floor(difficultyConfig[currentDifficulty].gridSize / 4),
    });
  };
  useEffect(() => {
    if (!showDifficultyMenu) {
      const gridSize = difficultyConfig[currentDifficulty].gridSize;
      setSnake([
        {
          x: Math.floor(gridSize / 2),
          y: Math.floor(gridSize / 2),
        },
      ]);
      gameContainerRef.current.focus();
    }
  }, [showDifficultyMenu, currentDifficulty]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const currentDir = directionRef.current;
      let newDir = currentDir;
      console.log(e.key);
      switch (e.key) {
        case "ArrowUp":
        case "w":  // 修改 KeyW → w
          if (currentDir.y === 0) newDir = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":  // 修改 KeyS → s
          if (currentDir.y === 0) newDir = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":  // 修改 KeyA → a
          if (currentDir.x === 0) newDir = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":  // 修改 KeyD → d
          if (currentDir.x === 0) newDir = { x: 1, y: 0 };
          break;
      }

      if (newDir !== currentDir) {
        directionRef.current = newDir;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    if (gameOver || !currentDifficulty || showDifficultyMenu) return;

    const gameLoop = setInterval(() => {
      setSnake((prev) => {
        const newSnake = [...prev];
        const currentDir = directionRef.current;
        const head = {
          x: newSnake[0].x + currentDir.x,
          y: newSnake[0].y + currentDir.y,
        };

        // 边界检测
        if (
          head.x < 0 ||
          head.x >= difficultyConfig[currentDifficulty].gridSize ||
          head.y < 0 ||
          head.y >= difficultyConfig[currentDifficulty].gridSize
        ) {
          setGameOver(true);
          return newSnake;
        }

        // 自碰检测
        if (
          newSnake.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          setGameOver(true);
          return newSnake;
        }

        newSnake.unshift(head);

        // 食物检测
        if (head.x === food.x && head.y === food.y) {
          setFood({
            x: Math.floor(
              Math.random() * difficultyConfig[currentDifficulty].gridSize
            ),
            y: Math.floor(
              Math.random() * difficultyConfig[currentDifficulty].gridSize
            ),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, difficultyConfig[currentDifficulty].speed);

    return () => clearInterval(gameLoop);
  }, [gameOver, food, currentDifficulty, showDifficultyMenu]);

  return (
    <div
      className="game-container"
      ref={gameContainerRef}
      tabIndex={0}
      onClick={() => gameContainerRef.current.focus()}
    >
      <div className="difficulty-menu">
        <h2>选择游戏难度</h2>
        {Object.keys(difficultyConfig).map((difficulty) => (
          <button
            key={difficulty}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.target.blur();
              setCurrentDifficulty(difficulty);
              resetGame();
              setShowDifficultyMenu(false);
              setFood({
                x: Math.floor(difficultyConfig[difficulty].gridSize / 4),
                y: Math.floor(difficultyConfig[difficulty].gridSize / 4),
              });
              gameContainerRef.current.focus();
            }}
          >
            {difficulty}
          </button>
        ))}
      </div>
      <div className="grid">
        {snake.map((segment, index) => (
          <div
            key={index}
            className="snake"
            style={{
              left: `${
                segment.x * (100 / difficultyConfig[currentDifficulty].gridSize)
              }%`,
              top: `${
                segment.y * (100 / difficultyConfig[currentDifficulty].gridSize)
              }%`,
              width: `${100 / difficultyConfig[currentDifficulty].gridSize}%`,
              height: `${100 / difficultyConfig[currentDifficulty].gridSize}%`,
            }}
          />
        ))}
        <div
          className="food"
          style={{
            left: `${
              food.x * (100 / difficultyConfig[currentDifficulty].gridSize)
            }%`,
            top: `${
              food.y * (100 / difficultyConfig[currentDifficulty].gridSize)
            }%`,
            width: `${100 / difficultyConfig[currentDifficulty].gridSize}%`,
            height: `${100 / difficultyConfig[currentDifficulty].gridSize}%`,
          }}
        />
      </div>
      {gameOver && <div className="game-over">Game Over!</div>}
    </div>
  );
}

export default App;
