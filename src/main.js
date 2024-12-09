// Get grid points (intersections between cells where paths can run)
function getGridPoints() {
  const points = [];
  // Generate points at the center of gaps between cells
  for (let i = 0; i <= GRID_SIZE; i++) {
    for (let j = 0; j <= GRID_SIZE; j++) {
      // Only add points that are at valid path locations
      // For vertical lines (between columns)
      if (j < GRID_SIZE) {
        points.push({
          x: j * (CELL_SIZE + GAP_SIZE) + CELL_SIZE,
          y: i * (CELL_SIZE + GAP_SIZE) + CELL_SIZE / 2,
          type: 'vertical'
        });
      }
      // For horizontal lines (between rows)
      if (i < GRID_SIZE) {
        points.push({
          x: j * (CELL_SIZE + GAP_SIZE) + CELL_SIZE / 2,
          y: i * (CELL_SIZE + GAP_SIZE) + CELL_SIZE,
          type: 'horizontal'
        });
      }
    }
  }
  return points;
}

// Get valid neighbors for a point
function getNeighbors(point, gridPoints) {
  return gridPoints.filter(p => {
    // Points are neighbors if:
    // 1. They're properly aligned (share x or y coordinate)
    // 2. They're adjacent (exactly one cell + gap apart)
    // 3. They respect the point types (vertical connects to horizontal and vice versa)
    const isVerticalConnection = point.type === 'vertical' && p.type === 'horizontal';
    const isHorizontalConnection = point.type === 'horizontal' && p.type === 'vertical';
    
    if (isVerticalConnection || isHorizontalConnection) {
      const distance = Math.sqrt(
        Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)
      );
      // Allow connections only if they're the right distance apart
      return distance <= CELL_SIZE / 2;
    }
    
    // Allow connections between same types if they're one cell apart
    if (point.type === p.type) {
      if (point.type === 'vertical') {
        return point.x === p.x && Math.abs(p.y - point.y) === (CELL_SIZE + GAP_SIZE);
      } else {
        return point.y === p.y && Math.abs(p.x - point.x) === (CELL_SIZE + GAP_SIZE);
      }
    }
    
    return false;
  });
}

// Modified findPath function
function findPath(start, end) {
  const gridPoints = getGridPoints();
  
  // Find nearest valid grid points to start and end
  const startPoint = gridPoints.reduce((nearest, point) => {
    const dist = Math.sqrt(
      Math.pow(point.x - start.x, 2) + Math.pow(point.y - start.y, 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(nearest.x - start.x, 2) + Math.pow(nearest.y - start.y, 2)
    );
    return dist < currentDist ? point : nearest;
  }, gridPoints[0]);
  
  const endPoint = gridPoints.reduce((nearest, point) => {
    const dist = Math.sqrt(
      Math.pow(point.x - end.x, 2) + Math.pow(point.y - end.y, 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(nearest.x - end.x, 2) + Math.pow(nearest.y - end.y, 2)
    );
    return dist < currentDist ? point : nearest;
  }, gridPoints[0]);

  // The rest of the A* implementation remains the same
  const openSet = [startPoint];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();
  
  gridPoints.forEach(point => {
    gScore.set(JSON.stringify(point), Infinity);
    fScore.set(JSON.stringify(point), Infinity);
  });
  
  gScore.set(JSON.stringify(startPoint), 0);
  fScore.set(JSON.stringify(startPoint), heuristic(startPoint, endPoint));
  
  while (openSet.length > 0) {
    const current = openSet.reduce((min, point) => 
      fScore.get(JSON.stringify(point)) < fScore.get(JSON.stringify(min)) ? point : min
    );
    
    if (current.x === endPoint.x && current.y === endPoint.y) {
      const path = [start];
      let temp = current;
      while (cameFrom.has(JSON.stringify(temp))) {
        temp = cameFrom.get(JSON.stringify(temp));
        path.push(temp);
      }
      path.push(end);
      return path;
    }
    
    openSet.splice(openSet.indexOf(current), 1);
    
    for (const neighbor of getNeighbors(current, gridPoints)) {
      const tentativeGScore = gScore.get(JSON.stringify(current)) + 
        Math.sqrt(Math.pow(current.x - neighbor.x, 2) + Math.pow(current.y - neighbor.y, 2));
      
      if (tentativeGScore < gScore.get(JSON.stringify(neighbor))) {
        cameFrom.set(JSON.stringify(neighbor), current);
        gScore.set(JSON.stringify(neighbor), tentativeGScore);
        fScore.set(JSON.stringify(neighbor), tentativeGScore + heuristic(neighbor, endPoint));
        
        if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return [start, end];
}