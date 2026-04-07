import React, { useState, useEffect, useMemo } from "react";

// --- Configuration ---
const MEMBER_NAMES = ["Wonyoung", "Yujin", "Rei", "Gaeul", "Leeseo", "Liz", "Ana", "Carmen", "Ian", "Jiwoo", "Juun", "Stella", "Yeon", "Yuha", "Ahyeon", "Rora", "Ruka", "Asa", "Rami", "Pharita", "Chiquita", "Beni", "Yihyun", "Mia", "Kumi"];
const MEMBER_IMAGES = {
  Wonyoung: "Wonyoung.jpg",
  Yujin: "Yujin.webp",
  Rei: "Rei.png",
  Gaeul: "Gaeul.jfif",
  Leeseo: "leeseo.jpeg",
  Liz: "Liz.jpeg",
  Ana: "ana.jpg",
  Carmen: "carmen.jfif",
  Ian: "ian.png",
  Jiwoo: "jiwoo.jfif",
  Juun: "juun.jfif",
  Stella: "stella.jfif",
  Yeon: "yeon.jfif",
  Yuha: "yuha.jpg",
  Ahyeon: "ahyeon.jfif",
  Rora: "rora.jpg",
  Ruka: "ruka.jfif",
  Asa: "asa.jfif",
  Rami: "rami.jfif",
  Pharita: "pharita.jfif",
  Chiquita: "chiquita.jfif",
  Beni: "beni.jfif",
  Yihyun: "yihyun.jfif",
  Mia: "mia.jfif",
  Kumi: "kumi.jfif"

};

const getRandomStat = () => Math.floor(Math.random() * 9) + 1;

export default function App() {
  const [mode, setMode] = useState(null); 
  const [board, setBoard] = useState(Array(3).fill(null).map(() => Array(3).fill(null)));
  const [hand, setHand] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [totalPlacements, setTotalPlacements] = useState(0);

  // 1. MASTER STATS GENERATION
  const masterStats = useMemo(() => {
    const stats = {};
    MEMBER_NAMES.forEach(name => {
      stats[name] = { up: getRandomStat(), down: getRandomStat(), left: getRandomStat(), right: getRandomStat() };
    });
    return stats;
  }, []);

  const modeImages = useMemo(() => {
    const shuffled = [...MEMBER_NAMES].sort(() => 0.5 - Math.random());
    return { hard: MEMBER_IMAGES[shuffled[0]], easy: MEMBER_IMAGES[shuffled[1]] };
  }, []);

  const createCard = (owner = "player") => {
    const name = MEMBER_NAMES[Math.floor(Math.random() * MEMBER_NAMES.length)];
    return {
      ...masterStats[name],
      name,
      img: MEMBER_IMAGES[name],
      owner,
      id: Math.random().toString(36).substr(2, 9)
    };
  };

  useEffect(() => {
    if (mode) setHand(Array(3).fill(null).map(() => createCard("player")));
  }, [mode]);

  // 2. WINNING CONDITIONS
  useEffect(() => {
    if (!mode || gameOver) return;

    let pOnBoard = 0;
    let bOnBoard = 0;
    let isFull = true;

    board.forEach(row => row.forEach(c => {
      if (c) {
        if (c.owner === "player") pOnBoard++;
        else bOnBoard++;
      } else {
        isFull = false;
      }
    }));

    // ELIMINATION RULE (Threshold: 10 moves)
    if (totalPlacements >= 10) {
      if (pOnBoard === 0 && !isBotTurn) {
        setWinner("Bot (Player Wiped Out)");
        setGameOver(true);
        return;
      }
      if (bOnBoard === 0 && isBotTurn) {
        setWinner("Player (Bot Wiped Out)");
        setGameOver(true);
        return;
      }
    }

    if (isFull) {
      setWinner(pOnBoard > bOnBoard ? "Player" : pOnBoard < bOnBoard ? "Bot" : "Draw");
      setGameOver(true);
    }
  }, [board, gameOver, mode, isBotTurn, totalPlacements]);

  // 3. UPDATED BATTLE LOGIC (Same Number = Both Die)
  const checkCaptures = (currentBoard, r, c) => {
    const target = currentBoard[r][c];
    if (!target) return currentBoard;

    const adj = [
      { dr: -1, dc: 0, tSide: "up", nSide: "down" },
      { dr: 1, dc: 0, tSide: "down", nSide: "up" },
      { dr: 0, dc: -1, tSide: "left", nSide: "right" },
      { dr: 0, dc: 1, tSide: "right", nSide: "left" }
    ];

    let newBoard = currentBoard.map(row => [...row]);

    adj.forEach(({ dr, dc, tSide, nSide }) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3 && newBoard[nr][nc]) {
        const neighbor = newBoard[nr][nc];
        if (neighbor.owner !== target.owner) {
          
          if (target[tSide] > neighbor[nSide]) {
            // Target Wins
            if (mode === 'hard') {
              const newValue = Math.max(1, target[tSide] - neighbor[nSide]);
              newBoard[r][c] = { ...newBoard[r][c], [tSide]: newValue };
            }
            newBoard[nr][nc] = null; 
          } 
          else if (target[tSide] < neighbor[nSide]) {
            // Neighbor Wins
            if (mode === 'hard') {
              const newValue = Math.max(1, neighbor[nSide] - target[tSide]);
              newBoard[nr][nc] = { ...newBoard[nr][nc], [nSide]: newValue };
            }
            newBoard[r][c] = null; 
          }
          else if (target[tSide] === neighbor[nSide]) {
            // SAME NUMBER: BOTH DIE
            newBoard[r][c] = null;
            newBoard[nr][nc] = null;
          }
        }
      }
    });
    return newBoard;
  };

  const handlePlaceCard = (r, c) => {
    if (!selectedId || board[r][c] || isBotTurn || gameOver) return;
    const card = { ...hand.find(c => c.id === selectedId) };
    const nextBoard = board.map(row => [...row]);
    nextBoard[r][c] = card;
    setBoard(checkCaptures(nextBoard, r, c));
    setHand(hand.filter(item => item.id !== selectedId));
    setSelectedId(null);
    setTotalPlacements(prev => prev + 1);
    setIsBotTurn(true);
  };

  const handleDrawCard = () => {
    if (!isBotTurn && !hasDrawn && hand.length < 5 && !gameOver) {
      setHand([...hand, createCard("player")]);
      setHasDrawn(true);
    }
  };

  useEffect(() => {
    if (isBotTurn && !gameOver) {
      const timer = setTimeout(() => {
        const empty = [];
        board.forEach((row, r) => row.forEach((cell, c) => { if (!cell) empty.push({ r, c }); }));
        if (empty.length > 0) {
          const { r, c } = empty[Math.floor(Math.random() * empty.length)];
          const nextBoard = board.map(row => [...row]);
          nextBoard[r][c] = createCard("bot");
          setBoard(checkCaptures(nextBoard, r, c));
          setTotalPlacements(prev => prev + 1);
        }
        setHasDrawn(false); 
        setIsBotTurn(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isBotTurn, board, gameOver]);

  // 4. UI SCREENS
  if (!mode) {
    return (
      <div style={styles.container}>
        <div style={styles.modeScreen}>
          <div style={styles.modeLabel}>
            <div style={{fontSize: '14px', opacity: 0.8}}>CHOOSE YOUR BATTLE</div>
            <div style={{fontSize: '32px', fontWeight: 'bold'}}>KPOP CARD GAME</div>
          </div>
          <div style={styles.modeOptions}>
            <button style={styles.modeCardWrapper} onClick={() => setMode('hard')}>
              <div style={styles.cardSilhouetteRed}>
                <img src={`/${modeImages.hard}`} alt="S" style={styles.silhouetteImg} />
                <div style={styles.cardLabel}>HARD</div>
              </div>
            </button>
            <button style={styles.modeCardWrapper} onClick={() => setMode('easy')}>
              <div style={styles.cardSilhouetteGreen}>
                <img src={`/${modeImages.easy}`} alt="S" style={styles.silhouetteImg} />
                <div style={styles.cardLabel}>EASY</div>
              </div>
            </button>
          </div>
          <p style={{fontSize: '12px', opacity: 0.5}}>Use KPOP cards to win!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {gameOver && (
        <div style={styles.overlay}>
          <div style={styles.winBox}>
            <h1 style={{fontSize: '24px'}}>MATCH OVER</h1>
            <h2 style={{color: winner.includes("Player") ? "#00ffcc" : "#ff4444"}}>{winner}</h2>
            <button style={styles.restartBtn} onClick={() => window.location.reload()}>RESTART</button>
          </div>
        </div>
      )}

      <div style={styles.gameArea}>
        <div style={styles.board}>
          {board.map((row, r) => row.map((card, c) => (
            <div key={`${r}-${c}`} style={styles.cell} onClick={() => handlePlaceCard(r, c)}>
              {card && <Card card={card} />}
            </div>
          )))}
        </div>

        <div style={styles.sidePanel}>
          <div style={styles.statusBox}>
            <div style={{fontSize: '11px', color: '#888'}}>INFINITE DECK | MOVES: {totalPlacements}</div>
            <h2 style={{ color: isBotTurn ? "#ff0066" : "#00ffcc", margin: 0 }}>
              {isBotTurn ? "Bot's Turn" : "Your Turn"}
            </h2>
          </div>

          <button 
            onClick={handleDrawCard}
            disabled={isBotTurn || hasDrawn || hand.length >= 5 || gameOver}
            style={{...styles.drawButton, backgroundColor: (isBotTurn || hasDrawn || hand.length >= 5) ? "#444" : "#00ffcc"}}
          >
            {hasDrawn ? "Hand Ready" : "Draw Card"}
          </button>

          <div style={styles.handList}>
            {hand.map(card => (
              <div 
                key={card.id} 
                onClick={() => !isBotTurn && setSelectedId(card.id)}
                style={{ ...styles.cardWrapper, border: selectedId === card.id ? "3px solid #00ffcc" : "2px solid transparent"}}
              >
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ card }) {
  const isP = card.owner === "player";
  return (
    <div style={{ ...styles.card, borderColor: isP ? "#00ffcc" : "#ff0066" }}>
      <img src={`/${card.img}`} alt={card.name} style={styles.cardImg} onError={(e) => { e.target.style.display = 'none' }} />
      <div style={{ ...styles.stat, top: 4, left: "42%" }}>{card.up}</div>
      <div style={{ ...styles.stat, bottom: 4, left: "42%" }}>{card.down}</div>
      <div style={{ ...styles.stat, left: 4, top: "42%" }}>{card.left}</div>
      <div style={{ ...styles.stat, right: 4, top: "42%" }}>{card.right}</div>
      <div style={styles.cardLabel}>{card.name}</div>
    </div>
  );
}

const styles = {
  container: { display: "flex", backgroundColor: "#0a0a0a", color: "white", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" },
  modeScreen: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', background: "#111", padding: "50px", borderRadius: "15px", border: "1px solid #333" },
  modeLabel: { textAlign: 'center' },
  modeOptions: { display: 'flex', gap: '40px' },
  modeCardWrapper: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  cardSilhouetteRed: { width: 140, height: 180, position: "relative", borderRadius: "8px", border: "3px solid #ff4444", overflow: "hidden", backgroundColor: "#000" },
  cardSilhouetteGreen: { width: 140, height: 180, position: "relative", borderRadius: "8px", border: "3px solid #00ffcc", overflow: "hidden", backgroundColor: "#000" },
  silhouetteImg: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.3, filter: 'grayscale(1)' },
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 },
  winBox: { background: "#111", padding: "50px", borderRadius: "15px", textAlign: "center", border: "2px solid #333" },
  restartBtn: { marginTop: "20px", padding: "12px 24px", background: "#00ffcc", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  gameArea: { display: "flex", gap: "40px", alignItems: "flex-start" },
  board: { display: "grid", gridTemplateColumns: "repeat(3, 140px)", gridTemplateRows: "repeat(3, 180px)", gap: "12px", background: "#1a1a1a", padding: "15px", borderRadius: "12px" },
  cell: { width: 140, height: 180, background: "#222", borderRadius: "8px", border: "1px solid #333", position: "relative" },
  sidePanel: { width: "200px", display: "flex", flexDirection: "column", gap: "12px" },
  statusBox: { background: "#1a1a1a", padding: "12px", borderRadius: "8px", textAlign: "center", border: '1px solid #333' },
  drawButton: { padding: "10px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" },
  handList: { display: "flex", flexDirection: "column", gap: "8px", background: "#111", padding: "10px", borderRadius: "8px", border: "1px solid #333", maxHeight: "480px", overflowY: "auto" },
  cardWrapper: { padding: "4px", borderRadius: "10px", cursor: "pointer", display: "flex", justifyContent: "center" },
  card: { width: 134, height: 174, position: "relative", borderRadius: "6px", border: "3px solid", overflow: "hidden", backgroundColor: "#000" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 },
  stat: { position: "absolute", fontWeight: "900", background: "rgba(0,0,0,0.85)", color: "white", borderRadius: "50%", width: 22, height: 22, textAlign: "center", fontSize: "13px", zIndex: 2 },
  cardLabel: { position: "absolute", top: "50%", width: "100%", textAlign: "center", transform: "translateY(-50%)", fontWeight: "bold", textShadow: "2px 2px 4px #000", zIndex: 1, fontSize: "14px" }
};