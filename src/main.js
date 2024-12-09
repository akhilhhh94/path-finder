import PF from 'pathfinding';
      let grid = new PF.Grid(600, 600);

      for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
          grid.setWalkableAt(x, y, false);
          
          // Check horizontal paths (every 120 units starting at 120)
          if ((x - 120) % 120 === 0 && x <= grid.width || x === grid.width -1) { 
            grid.setWalkableAt(x, y, true);
        
          }
          
          // Check vertical paths (every 120 units starting at 120)
          if ((y - 120) % 120 === 0 && y <= grid.height  || y === grid.height -1) {
            grid.setWalkableAt(x, y, true);
         
          }
          // set vertical walkable paths with gaps
          if ((y - 60) % 120 === 0 && y <= grid.height && 
              ((x >= 0 && x <= 10) || (x >= 110 && x <= 130) || (x >= 220 && x <= 250) || 
               (x >= 340 && x <= 370) || (x >= 460 && x <= 490) || (x >= 590 && x <= 600))) {
            grid.setWalkableAt(x, y, true);
       
          }

         
            if ((x - 60) % 120 === 0 && x <= grid.width && 
              ((y >= 0 && y <= 10) || (y >= 110 && y <= 130) || (y >= 230 && y <= 250) || 
               (y >= 350 && y <= 370) || (y >= 470 && y <= 490) || (y >= 590 && y <= 600))) {
            grid.setWalkableAt(x, y, true);
            }

        }
      }

     
      function addRedDotsToWalkableNodes() {
        var allWalkable = [];

        // loop through all nodes and get all walkable nodes like [{x: 100, y: 50}, {x: 101, y: 50}, {x: 102, y: 50}, ....] on vertical nd horizontal lines basis
        for (var x = 0; x < grid.width; x++) {
          for (var y = 0; y < grid.height; y++) {
            if (grid.nodes[y][x].walkable) {
              allWalkable.push({ x, y });
            }
          }
        }



        //transform allWalkable to a matrix grid
       // console.log(allWalkable);
        // add a red dot on each walkable node in the grid svg
        const svg = document.getElementById('svg');
        allWalkable.forEach(({ x, y }) => {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', x);
          circle.setAttribute('cy', y);
          circle.setAttribute('r', 1);
          circle.setAttribute('fill', 'red');
          svg.appendChild(circle);
        });
      }

     //addRedDotsToWalkableNodes();

     //// var finder = new PF.Heuristic();
      var finder = new PF.AStarFinder({
        heuristic: PF.Heuristic.manhattan,
        biDirectional: true,
      });
      //var path = finder.findPath(100, 50, 120, 170, grid);
      //console.log(path);
      // add a red background to the cells in the path
     /* path.forEach(function (path) {
        var cell = matrixGridContainer.children[path[1]].children[path[0]];
        cell.style.backgroundColor = 'red';
      });*/
     

      function getPath(start, end) {
        // using console, trace the time taken to find the path
        console.time('getPath');
        
        var gridBackup = grid.clone();

        var path = finder.findPath(start.x, start.y, end.x, end.y, gridBackup);
        //console.log("gridBackup", gridBackup);
        // trace te time end here
        console.timeEnd('getPath');

        return path;
      }






      // new logic end here
     const GRID_SIZE = 5;
      const CELL_SIZE = 101;
      let GAP_PADDING = 10.01; // Configurable gap padding
      let paths = []; // Store multiple paths



      let sourceButton = null;

      // Create grid cells
      const gridElem = document.getElementById('grid');
      const rows = 5; // Change this value to create different number of rows
      const cols = 5; // Change this value to create different number of columns
      for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.id = `cell-${i + 1}`;
        cell.textContent = i + 1;

        ['top', 'right', 'bottom', 'left'].forEach(direction => {
          const button = document.createElement('button');
          button.className = `direction-button ${direction}-button`;
          button.dataset.direction = direction;
          cell.appendChild(button);
        });

        gridElem.appendChild(cell);
      }
      function getButtonPosition(button) {
        const svgRect = document.getElementById('svg').getBoundingClientRect();
        const cellRect = button.closest('.grid-cell').getBoundingClientRect();
        
        let x = cellRect.left + cellRect.width / 2 - svgRect.left;
        let y = cellRect.top + cellRect.height / 2 - svgRect.top;
        
        switch (button.dataset.direction) {
          case 'top':
            y = cellRect.top - svgRect.top;
            x = cellRect.left + cellRect.width / 2 - svgRect.left;
            break;
          case 'bottom':
            y = cellRect.bottom - svgRect.top;
            x = cellRect.left + cellRect.width / 2 - svgRect.left;
            break;
          case 'left':
            x = cellRect.left - svgRect.left;
            y = cellRect.top + cellRect.height / 2 - svgRect.top;
            break;
          case 'right':
            x = cellRect.right - svgRect.left;
            y = cellRect.top + cellRect.height / 2 - svgRect.top;
            break;
        }

        return { x, y };
      }



      function drawPath(path) {
        if (!path || path.length < 2) return;
        
        const pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Generate stepped path
        for (let i = 0; i < path.length - 1; i++) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', path[i].x);
          line.setAttribute('y1', path[i].y);
          line.setAttribute('x2', path[i + 1].x);
          line.setAttribute('y2', path[i + 1].y);
          line.setAttribute('stroke', '#fe1115');
          line.setAttribute('stroke-width', '2');
          pathGroup.appendChild(line);
        }
        
        // Add arrow at the end
        const last = path[path.length - 1];
        const secondLast = path[path.length - 2];
        const angle = Math.atan2(last.y - secondLast.y, last.x - secondLast.x);
        const arrowSize = 8;
        
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = [
          [last.x, last.y],
          [last.x - arrowSize * Math.cos(angle - Math.PI/6), last.y - arrowSize * Math.sin(angle - Math.PI/6)],
          [last.x - arrowSize * Math.cos(angle + Math.PI/6), last.y - arrowSize * Math.sin(angle + Math.PI/6)]
        ].map(point => point.join(',')).join(' ');
        
        arrow.setAttribute('points', points);
        arrow.setAttribute('fill', '#fe1115');
        pathGroup.appendChild(arrow);
        
        return pathGroup;
      }
      function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}


function transformPath(input) {
    if (!input || input.length < 2) return [];
    
    const result = [];
    
    // Add first point
    result.push({
        x: input[0][0],
        y: input[0][1]
    });
    
    let currentDirection = null;
    
    for (let i = 1; i < input.length; i++) {
        const prevPoint = input[i - 1];
        const currentPoint = input[i];
        
        // Determine direction of current segment
        let newDirection;
        if (currentPoint[0] !== prevPoint[0]) {
            newDirection = 'horizontal';
        } else if (currentPoint[1] !== prevPoint[1]) {
            newDirection = 'vertical';
        }
        
        // If direction changes or we're at the last point, add the point
        if (newDirection !== currentDirection || i === input.length - 1) {
            if (i !== input.length - 1) {
                result.push({
                    x: prevPoint[0],
                    y: prevPoint[1]
                });
            } else {
                // Add the last point
                result.push({
                    x: currentPoint[0],
                    y: currentPoint[1]
                });
            }
            currentDirection = newDirection;
        }
    }
    
    return result;
}

      function handleButtonClick(e) {

        console.log("getButtonPosition", getButtonPosition(e.target))
        // set start and end points
        






        if (!e.target.classList.contains('direction-button')) return;
        
        const button = e.target;
        
        if (!sourceButton) {
          sourceButton = button;
          button.classList.add('active');
          button.closest('.grid-cell').classList.add('selected');
        } else {
          if (sourceButton === button) {
            button.classList.remove('active');
            button.closest('.grid-cell').classList.remove('selected');
            sourceButton = null;
            return;
          }
          
          const start = getButtonPosition(sourceButton);
          const end = getButtonPosition(button);
          
          //const path = findPath(start, end);
          //console.log(path, "path");

          const path2 = getPath(start, end);
          //console.log("getPath", path2);
          // loop path2 and create a logic to group coordinates x, y based in straight line (consider metrix vertical ans horizontal lines)
          // like [100, 50], [101, 50], [102, 50] upto [n, 50] is a straight line of should be grouped together
          // like horizontal line [100, 50], [100, 51], [100, 52] upto [100, n] is a straight line of should be grouped together
          // grouped output should be [0: {x: 100, y: 50} , 1: {x: n, y: 50}, 2:{x: 100, y: 50}, ....}, ....]
          let straightLines = transformPath(path2);


         
          //console.log("Grouped straight lines:", straightLines);
          // remove forst value of straightLines
          //straightLines.shift();


          






          if (straightLines) {
            const pathElement = drawPath(straightLines);
            if (pathElement) {
              document.getElementById('svg').appendChild(pathElement);
              paths.push(pathElement);
            }
          }
          
          sourceButton.classList.remove('active');
          sourceButton.closest('.grid-cell').classList.remove('selected');
          sourceButton = null;
        }
      }

      function clearPaths() {
        paths.forEach(path => path.remove());
        paths = [];
        if (sourceButton) {
          sourceButton.classList.remove('active');
          sourceButton.closest('.grid-cell').classList.remove('selected');
          sourceButton = null;
        }
      }


      document.addEventListener('click', handleButtonClick);
      window.clearPaths = clearPaths;
      //window.updateGapSize = updateGapSize; 