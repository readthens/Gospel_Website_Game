import { PhaserGame } from './components/PhaserGame'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Make Your Own Gospel</p>
        <h1>When the Water Doesn&apos;t Come</h1>
        <p className="shell-copy">
          A short narrative game about a student witness, Filipino farmers, broken irrigation, and the choice to stay after seeing the cost.
          Use a keyboard. Refresh starts the story over.
        </p>
      </header>

      <main className="game-panel">
        <PhaserGame />
      </main>

      <p className="mobile-note">Best experienced with a keyboard.</p>
    </div>
  )
}

export default App
