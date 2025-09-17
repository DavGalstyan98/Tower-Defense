# Tower Defense Game

A modern Tower Defense game built with React, TypeScript, and Canvas rendering. This project demonstrates advanced frontend engineering skills including performance optimization, deterministic game logic, clean architecture, and accessibility.

## 🎮 Game Features

### Core Gameplay
- **10 Progressive Waves**: Increasingly difficult enemy waves with different mob types
- **3 Tower Types**: Arrow (fast single-target), Cannon (AoE splash), Frost (slow debuff)
- **Tower Upgrades**: 2 upgrade tiers per tower with stat improvements
- **Economy System**: Earn money by defeating enemies, spend on towers and upgrades
- **Lives System**: Lose lives when enemies reach your base

### Enemy Types
- **Normal**: Balanced stats, moderate speed and health
- **Fast**: High speed, low health, higher bounty
- **Tank**: High health and armor, slow speed
- **Flying**: Moderate stats, ignores path collisions (future feature)

### Tower Mechanics
- **Targeting Strategies**: First, Last, Strongest, Weakest, Nearest
- **Combat Effects**: Armor reduction, splash damage, speed debuffs
- **Range Visualization**: See tower range when placing or selecting
- **DPS Calculation**: Real-time damage per second display

## 🏗️ Architecture

### Engine/UI Separation
The game follows a clean architecture pattern with complete separation between the game engine and React UI:

```
src/
├── engine/           # Pure TypeScript game logic (framework-agnostic)
│   ├── types.ts      # Core game types and interfaces
│   ├── constants.ts  # Game configuration and definitions
│   ├── grid.ts       # Grid system and A* pathfinding
│   ├── sim.ts        # Fixed-timestep simulation engine
│   ├── targeting.ts  # Tower targeting strategies
│   └── effects.ts    # Combat effects and damage calculation
├── renderers/        # Canvas rendering (imperative)
│   └── canvas.ts     # Canvas renderer for game field
├── state/            # React state management
│   └── store.ts      # Zustand store with game bindings
└── ui/               # React UI components
    ├── App.tsx       # Main application component
    ├── GameCanvas.tsx # Canvas wrapper with input handling
    ├── Hud.tsx       # Heads-up display
    ├── BuildBar.tsx  # Tower building interface
    └── TowerInfo.tsx # Tower details and upgrade panel
```

### Key Design Principles

1. **Deterministic Simulation**: All game logic is pure and deterministic
2. **Fixed Timestep**: 60Hz simulation with render interpolation
3. **Performance First**: Optimized for 60fps with 200+ entities
4. **Accessibility**: Keyboard controls and screen reader support
5. **Mobile Responsive**: Touch controls and responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd tower-defense

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run preview      # Preview production build
```

## 🎯 Game Rules

### Objective
Defend your base by placing towers along enemy paths. Prevent enemies from reaching your base to win.

### Controls
- **Mouse/Touch**: Click to place towers, select towers, interact with UI
- **Keyboard**: 
  - `1`, `2`, `3`: Select tower types
  - `Escape`: Deselect tower
  - `Space`: Pause/Resume (planned)

### Economy
- **Starting Money**: $100
- **Starting Lives**: 20
- **Income**: Earn money by defeating enemies
- **Expenses**: Build towers and upgrades

### Tower Stats
| Tower | Cost | Damage | Range | Rate | Special |
|-------|------|--------|-------|------|---------|
| Arrow | $50  | 25     | 3.0   | 2.0  | Fast single-target |
| Cannon| $100 | 80     | 2.5   | 0.8  | AoE splash (1.5 radius) |
| Frost | $75  | 15     | 2.5   | 1.5  | Slow (50% for 3s) |

## 🧪 Testing

The project includes comprehensive unit tests for core game mechanics:

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test
```

### Test Coverage
- Game state management
- Tower placement and targeting
- Combat mechanics and damage calculation
- Grid system and pathfinding
- Wave spawning and progression

## ⚡ Performance

### Optimization Strategies
- **Fixed Timestep**: 60Hz simulation prevents frame rate dependency
- **Canvas Rendering**: Imperative rendering outside React lifecycle
- **Entity Pooling**: Reuse arrays to reduce garbage collection
- **Spatial Partitioning**: Efficient collision detection
- **Render Interpolation**: Smooth visuals at any frame rate

### Performance Targets
- **60 FPS**: Maintained with 200+ active entities
- **Memory Stable**: No unbounded growth over 10-minute sessions
- **Mobile Optimized**: Works on Moto G class devices

## ♿ Accessibility

### Features
- **Keyboard Navigation**: All game actions accessible via keyboard
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast**: Respects system preferences
- **Reduced Motion**: Honors `prefers-reduced-motion`
- **Focus Management**: Clear focus indicators

### Implementation
- Semantic HTML structure
- ARIA labels for all interactive elements
- Keyboard event handling
- Focus-visible outlines
- Screen reader announcements

## 🔧 Technical Details

### Simulation Engine
- **Timestep**: 16.666ms (60Hz)
- **Deterministic**: Pure functions, no side effects
- **State Management**: Immutable updates with structural sharing
- **Collision Detection**: Distance-based with spatial optimization

### Rendering Pipeline
- **Canvas API**: 2D context with high DPI support
- **Render Loop**: `requestAnimationFrame` with fixed timestep
- **Interpolation**: Smooth entity movement between ticks
- **Layering**: Background, grid, entities, UI overlay

### State Management
- **Zustand**: Lightweight state management
- **Selectors**: Optimized React re-renders
- **Actions**: Pure functions for state updates
- **Subscriptions**: Efficient change detection

## 🚧 Future Enhancements

### Planned Features
- **Multiple Paths**: Support for complex map layouts
- **Flying Enemies**: Enemies that ignore path collisions
- **Save/Load**: Persistent game state
- **Replay System**: Record and playback games
- **Map Editor**: Create custom maps
- **Endless Mode**: Procedural wave generation

### Performance Improvements
- **Web Workers**: Offload simulation to background thread
- **WebGL**: Hardware-accelerated rendering
- **Object Pooling**: Reduce garbage collection
- **Spatial Hashing**: Optimize collision detection

## 📊 Performance Profiling

### Metrics to Monitor
- **Frame Time**: Target <16.67ms per frame
- **Entity Count**: Track mobs, towers, projectiles
- **Memory Usage**: Monitor for leaks
- **CPU Usage**: Profile simulation vs rendering

### Profiling Tools
- Browser DevTools Performance tab
- React DevTools Profiler
- Custom performance metrics overlay
- Lighthouse performance audit

## 🤝 Contributing

### Development Guidelines
1. **Type Safety**: Use TypeScript strictly
2. **Testing**: Write tests for new features
3. **Performance**: Profile before and after changes
4. **Accessibility**: Test with screen readers
5. **Documentation**: Update README for new features

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Functional programming patterns

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the excellent framework
- Zustand for lightweight state management
- Canvas API for high-performance rendering
- TypeScript for type safety and developer experience