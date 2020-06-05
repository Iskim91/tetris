document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('tetris');
  const context = canvas.getContext('2d')

  context.scale(20, 20);

  // This creates the T shape of the tetris

  const arenaSweep = () => {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; y-- ) {
      for (let x = 0; x < arena[y].length; x++) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      y++;

      player.score += rowCount * 10;
      rowCount *= 2;
    }
  }

  // this will check the collisions with the block
  const collide = (arena, player) => {
    const [m, o] = [player.matrix, player.pos]
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        // if my matrix's xy position is not 0
        if (m[y][x] !== 0 &&
          // and the arena's position with the y player's position and
          (arena[y + o.y] &&
          // and the arena's position with the xy player's position is not 0
          arena[y + o.y][x + o.x]) !== 0) {
          // there is collision
          return true;
        }
      }
    }
    return false
  }

  // this creates the area
  const createMatrix = (w, h) => {
    const matrix = [];
    //while h is not 0. this will decrease
    while (h--) {
      // this will create arrays.legth 12 and will those with 0
      matrix.push(new Array(w).fill(0));
    }
    return matrix
  }

  const createPiece = (type) => {
    switch(type) {
      case 'T':
        return [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0],
        ];
      case "O":
        return [
          [2, 2],
          [2, 2],
        ];
      case "L":
        return [
          [0, 3, 0],
          [0, 3, 0],
          [0, 3, 3],
        ];
      case "J":
        return [
          [0, 4, 0],
          [0, 4, 0],
          [4, 4, 0],
        ];
      case "I":
        return [
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
        ];
      case "S":
        return [
          [0, 6, 6],
          [6, 6, 0],
          [0, 0, 0],
        ];
      case "Z":
        return [
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0],
        ];
    }
  }

  // this function will clear the canvas and re-draw the shape
  const draw = () => {
    //clear canvas
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // this will print the saved arena
    drawMatrix(arena, {x: 0, y:0})

    // draws the shape
    drawMatrix(player.matrix, player.pos)
  };

  // drawing function
  const drawMatrix = (matrix, offset) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          // this gives it the color
          context.fillStyle = colors[value];
          // this gives it the height and width
          context.fillRect(x + offset.x,
                           y + offset.y,
                          1, 1);
        }
      });
    });
  }


  // this copies the current shapes into the arena
  const merge = (arena, player) => {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value
        }
      })
    })
  }

  // it will allow the player to go down using the down arrow

  const playerDrop = () => {
    player.pos.y ++;
    // if there is a collision
    if (collide(arena, player)) {
      //move back a block
      player.pos.y--;
      // merge the position with the arena
      merge(arena, player);
      // start from 0
      playerReset();
      arenaSweep();
      updateScore();
    }
    dropCounter = 0;
  }

  // this allows the player to move left and right and not colide with the sides
  const playerMove = (dir) => {
    player.pos.x += dir;
    if (collide(arena, player)) {
      player.pos.x -= dir;

    }
  }

  const playerReset = () => {
    const pieces = "ILJOTSZ";
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)])
    player.pos.y = 0;
    player.pos.x = (Math.floor(arena[0].length / 2)) -
                   (Math.floor(player.matrix[0].length / 2));
    if (collide(arena, player)) {
      arena.forEach(row => row.fill(0))
      player.score = 0;
      updateScore();
    }
  }

  const playerRotate = (dir) => {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    // if rotate and it colides with the wall
    while (collide(arena, player)) {
      // it will offset the block + offset
      player.pos.x += offset;
      // then set offset to a new value -2 at the beginning
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
  }

  const rotate = (matrix, dir) => {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < y; x++) {
        [
          matrix[x][y],
          matrix[y][x],
        ] = [
          matrix[y][x],
          matrix[x][y],
        ];
      }
    }
    if (dir > 0) {
      matrix.forEach(row => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  const colors = [
    null,
   'yellow',
   'deeppink',
   'mediumpurple',
   'white',
   'lime',
   'crimson',
    'deepskyblue'
  ]

  // This part makes the counter and lets it drop down
  let dropCounter = 0;
  let dropInterval = 1000;
  let lastTime = 0;


  const update = (time = 0) => {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if ( dropCounter > dropInterval) {
      playerDrop();
    }
    // every second it will update and redraw
    draw();
    requestAnimationFrame(update)
  }


  const updateScore = () => {
    document.getElementById('score').innerText = player.score;
  }
  // this is the arena/ canvas
  const arena = createMatrix(12, 20);

  // initial position of the block
  const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
  }

  // this allows the block to move
  document.addEventListener('keydown', event => {
    switch(event.keyCode) {
      case 37:
        playerMove(-1);
        // player.pos.x --;
        break;
      case 39:
        // player.pos.x ++;
        playerMove(1);
        break;
      case 40:
        playerDrop();
        break;
      case 81:
        playerRotate(-1);
        break;
      case 87:
        playerRotate(1);
        break;
    };
  });


  playerReset();
  updateScore();
  update();



























});
