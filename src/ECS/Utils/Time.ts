export class Time {
    timeScale = 1.0;
  
    rawDeltaTime = 0;   // Time between frames (unscaled)
    deltaTime = 0;      // rawDeltaTime * timeScale
  
    totalTime = 0;      // Time since app started (scaled)
    unscaledTime = 0;   // Time since app started (real time)
  
    frame = 0;          // Frame count since start
  
    update(rawDelta: number) {
      this.rawDeltaTime = rawDelta;
      this.deltaTime = rawDelta * this.timeScale;
  
      this.totalTime += this.deltaTime;
      this.unscaledTime += rawDelta;
  
      this.frame++;
    }
  }
  