# ADR-001: Fixed-Timestep Simulation Architecture

## Status
Accepted

## Context
Tower Defense games require precise, deterministic simulation to ensure consistent gameplay across different devices and frame rates. The simulation must handle complex interactions between entities (mobs, towers, projectiles) while maintaining 60 FPS performance targets.

## Decision
Implement a fixed-timestep simulation architecture with the following characteristics:

### Core Principles
1. **Fixed Timestep**: 60Hz simulation (16.666ms per tick)
2. **Deterministic Logic**: All game state changes are pure functions
3. **Engine/UI Separation**: Game logic is framework-agnostic
4. **Render Interpolation**: Smooth visuals independent of simulation rate

### Architecture Components

#### Simulation Engine (`src/engine/sim.ts`)
- **Pure Functions**: All game logic functions are pure and deterministic
- **Immutable Updates**: Game state is updated immutably
- **Tick-Based**: Game advances in discrete time steps
- **No Side Effects**: Simulation functions don't modify external state

#### Game Loop (`src/App.tsx`)
```typescript
const gameLoop = (currentTime: number) => {
  if (isRunning && game.state === 'playing') {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Fixed timestep simulation
    accumulator += deltaTime;
    while (accumulator >= TICK_DURATION) {
      game = advanceTick(game, TICK_DURATION);
      accumulator -= TICK_DURATION;
    }
    
    // Render with interpolation
    renderer.render(game);
  }
  
  requestAnimationFrame(gameLoop);
};
```

#### State Management (`src/state/store.ts`)
- **Zustand Store**: Lightweight state management
- **Selective Updates**: Only update components that need changes
- **Action-Based**: All state changes go through defined actions
- **Performance Optimized**: Minimize React re-renders

## Implementation Details

### Tick Rate and Timing
- **Simulation Rate**: 60Hz (16.666ms per tick)
- **Render Rate**: Variable (up to display refresh rate)
- **Interpolation**: Smooth entity movement between ticks
- **Accumulator**: Prevents simulation lag during frame drops

### Entity Management
- **Arrays**: Use typed arrays for performance
- **Object Pooling**: Reuse entity objects to reduce GC
- **Spatial Partitioning**: Efficient collision detection
- **Cleanup**: Remove dead entities each tick

### Collision Detection
- **Distance-Based**: Simple and fast for most cases
- **Spatial Hashing**: For large numbers of entities
- **Broad Phase**: Quick rejection of non-colliding pairs
- **Narrow Phase**: Precise collision for potential hits

### Targeting System
- **Strategy Pattern**: Configurable targeting algorithms
- **Range Queries**: Efficient spatial queries
- **Priority System**: Handle multiple valid targets
- **Performance**: O(n) complexity per tower

## Consequences

### Positive
- **Deterministic**: Consistent gameplay across devices
- **Performance**: Maintains 60 FPS with 200+ entities
- **Testable**: Pure functions are easy to unit test
- **Maintainable**: Clear separation of concerns
- **Scalable**: Architecture supports complex features

### Negative
- **Complexity**: More complex than simple frame-based updates
- **Memory**: Immutable updates create temporary objects
- **Learning Curve**: Developers must understand fixed timestep
- **Debugging**: Harder to debug timing-related issues

### Risks and Mitigations
- **Frame Drops**: Accumulator prevents simulation lag
- **Memory Leaks**: Object pooling and cleanup prevent leaks
- **Performance**: Profiling and optimization maintain targets
- **Complexity**: Clear documentation and examples

## Alternatives Considered

### Frame-Based Simulation
- **Pros**: Simpler implementation
- **Cons**: Non-deterministic, frame rate dependent
- **Decision**: Rejected due to consistency requirements

### Variable Timestep
- **Pros**: Simpler timing logic
- **Cons**: Non-deterministic, can cause instability
- **Decision**: Rejected due to precision requirements

### Event-Driven Architecture
- **Pros**: Efficient for sparse events
- **Cons**: Complex for continuous simulation
- **Decision**: Rejected due to continuous nature of game

## Performance Considerations

### Optimization Strategies
1. **Entity Pooling**: Reuse objects to reduce GC pressure
2. **Spatial Partitioning**: Efficient collision detection
3. **Render Culling**: Only render visible entities
4. **LOD System**: Reduce detail for distant entities
5. **Batch Operations**: Group similar operations

### Profiling Metrics
- **Frame Time**: Target <16.67ms per frame
- **Entity Count**: Track active entities
- **Memory Usage**: Monitor for leaks
- **CPU Usage**: Profile simulation vs rendering

### Performance Targets
- **60 FPS**: Maintained with 200+ entities
- **Memory Stable**: No unbounded growth
- **Mobile Support**: Works on Moto G class devices
- **Battery Efficient**: Optimized for mobile devices

## Testing Strategy

### Unit Tests
- **Pure Functions**: Test all simulation functions
- **Edge Cases**: Test boundary conditions
- **Performance**: Benchmark critical paths
- **Regression**: Prevent performance degradation

### Integration Tests
- **Game Loop**: Test complete simulation cycle
- **State Management**: Test state transitions
- **Rendering**: Test visual output
- **Input Handling**: Test user interactions

### Performance Tests
- **Load Testing**: Test with maximum entities
- **Stress Testing**: Test under high load
- **Memory Testing**: Test for leaks
- **Battery Testing**: Test mobile efficiency

## Future Considerations

### Scalability
- **Web Workers**: Move simulation to background thread
- **Multi-Threading**: Parallel entity processing
- **Distributed**: Multi-player support
- **Cloud**: Server-side simulation

### Features
- **Replay System**: Record and playback games
- **Save/Load**: Persistent game state
- **Multi-Player**: Real-time collaboration
- **AI**: Computer-controlled opponents

### Performance
- **WebGL**: Hardware-accelerated rendering
- **WASM**: Native performance for simulation
- **GPU**: Parallel processing
- **Optimization**: Continuous performance improvements

## Conclusion

The fixed-timestep simulation architecture provides the foundation for a high-performance, deterministic Tower Defense game. While more complex than simple frame-based approaches, it ensures consistent gameplay and supports the performance requirements for modern web applications.

The architecture is designed to be maintainable, testable, and scalable, supporting future enhancements while maintaining current performance targets.
