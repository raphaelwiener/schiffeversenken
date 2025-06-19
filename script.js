var playerBoard, computerBoard, playerShips, computerShips, state;
var availableMoves = [];
var targetQueue = [];
var targetHits = [];
var canPlay = true;
var gameOver = false;


$(document).ready(function() {
  console.log('Schiffe Versenken: Projektinitialisierung abgeschlossen');

  createGrid($('#playerBoard'));
  createGrid($('#computerBoard'));

  playerBoard = createBoard(10);
  computerBoard = createBoard(10);
  playerShips = placeShips(playerBoard);
  computerShips = placeShips(computerBoard);
  state = $('#status');

  $('#computerBoard').on('click', 'td.cell', handleCellClick);

  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      availableMoves.push({ r: i, c: j });
    }
  }

  renderPlayerShips();
});


function createGrid($container) {
  $container.empty();
  var letters = 'ABCDEFGHIJ'.split('');
  var size = 10;
  var $table = $('<table></table>');
  var $thead = $('<thead></thead>');
  var $headRow = $('<tr></tr>').append('<th></th>');

  for (var k = 0; k < letters.length; k++) {
    $headRow.append('<th>' + letters[k] + '</th>');
  }

  $thead.append($headRow);
  $table.append($thead);

  var $tbody = $('<tbody></tbody>');

  for (var i = 0; i < size; i++) {
    var $tr = $('<tr></tr>').append('<th>' + (i + 1) + '</th>');

    for (var j = 0; j < size; j++) {
      $tr.append(
        $('<td></td>')
          .attr('data-row', i)
          .attr('data-col', j)
          .addClass('cell')
      );
    }

    $tbody.append($tr);
  }var gameOver = false;

  $table.append($tbody);
  $container.append($table);
}


function createBoard(n) {
  var board = [];
  
  for (var i = 0; i < n; i++) {
    board[i] = [];
    for (var j = 0; j < n; j++) {
      board[i][j] = 0;
    }
  }
  return board;
}


function randomInt(n) {
  return Math.floor(Math.random() * n);
}

// Die Funktion enqueueNeighborsSmart wurde mit hilfe von KI erstellt.
function enqueueNeighborsSmart(r, c) {
  targetHits.push({ r: r, c: c });

  var orientation = null;
  if (targetHits.length >= 2) {
    var first = targetHits[0];
    var second = targetHits[1];
    if (first.r === second.r) {
      orientation = "horiz";
    } else if (first.c === second.c) {
      orientation = "vert";
    }
  }

  // Die Funktion takeIfAvailable wurde mit hilfe von KI erstellt.
  function takeIfAvailable(rr, cc) {
    if (rr < 0 || rr > 9 || cc < 0 || cc > 9) return;
    for (var i = 0; i < availableMoves.length; i++) {
      if (availableMoves[i].r === rr && availableMoves[i].c === cc) {
        targetQueue.push({ r: rr, c: cc });
        availableMoves.splice(i, 1);
        return;
      }
    }
  }

  if (orientation === null) {
    takeIfAvailable(r - 1, c); // oben
    takeIfAvailable(r + 1, c); // unten
    takeIfAvailable(r, c - 1); // links
    takeIfAvailable(r, c + 1); // rechts
  } else if (orientation === "horiz") {
    var row = targetHits[0].r;
    var minC = targetHits[0].c;
    var maxC = targetHits[0].c;
    for (var j = 1; j < targetHits.length; j++) {
      minC = Math.min(minC, targetHits[j].c);
      maxC = Math.max(maxC, targetHits[j].c);
    }
    takeIfAvailable(row, minC - 1);
    takeIfAvailable(row, maxC + 1);
  } else {
    var col = targetHits[0].c;
    var minR = targetHits[0].r;
    var maxR = targetHits[0].r;
    for (var j = 1; j < targetHits.length; j++) {
      minR = Math.min(minR, targetHits[j].r);
      maxR = Math.max(maxR, targetHits[j].r);
    }
    takeIfAvailable(minR - 1, col);
    takeIfAvailable(maxR + 1, col);
  }
}


function canPlace(board, r, c, len, horiz) {
  var size = board.length;

  for (var k = 0; k < len; k++) {
    var x = horiz ? r : r + k;
    var y = horiz ? c + k : c;

    if (x < 0 || x >= size || y < 0 || y >= size) {
      return false;
    }
    if (board[x][y] !== 0) {
      return false;
    }

    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        var nx = x + dx;
        var ny = y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          if (board[nx][ny] !== 0) {
            return false;
          }
        }
      }
    }
  }

  return true;
}


function placeShips(board) {
  var config = [5, 4, 3, 2, 1];
  var ships = [];

  for (var s = 0; s < config.length; s++) {
    var len = config[s];
    var placed = false;

    while (!placed) {
      var horiz = Math.random() < 0.5;
      var r = randomInt(board.length);
      var c = randomInt(board.length);

      if (canPlace(board, r, c, len, horiz)) {
        var coords = [];
        for (var k = 0; k < len; k++) {
          var x = horiz ? r : r + k;
          var y = horiz ? c + k : c;
          board[x][y] = 1;
          coords.push({ r: x, c: y });
        }
        ships.push(coords);
        placed = true;
      }
    }
  }

  return ships;
}


function markShipIfSunk(ships, boardId, boardData, r, c) {
  for (var s = 0; s < ships.length; s++) {
    var ship = ships[s];
    var belongsToThisShip = false;
    for (var t = 0; t < ship.length; t++) {
      if (ship[t].r === r && ship[t].c === c) {
        belongsToThisShip = true;
        break;
      }
    }
    if (!belongsToThisShip) continue;

    var allHit = true;
    for (var u = 0; u < ship.length; u++) {
      var rr = ship[u].r;
      var cc = ship[u].c;
      var selector = '#' + boardId + ' td[data-row="' + rr + '"][data-col="' + cc + '"]';
      if ($(selector).hasClass('hit') === false) {
        allHit = false;
        break;
      }
    }
    if (allHit) {
      for (var v = 0; v < ship.length; v++) {
        var rr2 = ship[v].r;
        var cc2 = ship[v].c;
        var sel2 = '#' + boardId + ' td[data-row="' + rr2 + '"][data-col="' + cc2 + '"]';
        $(sel2).removeClass('hit');
        $(sel2).addClass('sunk');
      }
      return true;
    }
    break;
  }
  return false;
}


function handleCellClick() {
  if (!canPlay) return;
  canPlay = false;

  var $cell = $(this);
  var r = parseInt($cell.attr('data-row'), 10);
  var c = parseInt($cell.attr('data-col'), 10);

  if ($cell.hasClass('hit') || $cell.hasClass('miss') || $cell.hasClass('sunk')) {
    canPlay = true;
    return;
  }

  if (computerBoard[r][c] === 1) {
    $cell.addClass('hit');
    var wasSunk = markShipIfSunk(computerShips, 'computerBoard', computerBoard, r, c);
    if (wasSunk) {
      state.text('Schiff versenkt! Du darfst weiterhin schießen.');
    } else {
      state.text('Treffer! Du darfst nochmal schießen.');
    }
    canPlay = true;
    checkWin();
  } else {
    $cell.addClass('miss');
    state.text('Wasser! Computer ist dran...');
    setTimeout(function() {
      computerTurn();
    }, 2000);
  }
}


function checkWin() {
  var allSunk = true;
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if (computerBoard[i][j] === 1) {
        var sel = '#computerBoard td[data-row="' + i + '"][data-col="' + j + '"]';
        var hasHit = $(sel).hasClass('hit');
        var hasSunk = $(sel).hasClass('sunk');

        if (!hasHit && !hasSunk) {
          allSunk = false;
        }
      }
    }
  }

  if (allSunk) {
    state.text('Du hast gewonnen! 🎉');
    $('#computerBoard').off('click', 'td.cell', handleCellClick);
    alert('Herzlichen Glückwunsch, du hast gewonnen!');
  }
}


function renderPlayerShips() {
  for (var s = 0; s < playerShips.length; s++) {
    var ship = playerShips[s];

    for (var i = 0; i < ship.length; i++) {
      var cell = ship[i];
      $('#playerBoard td[data-row="' + cell.r + '"][data-col="' + cell.c + '"]').addClass('ship');
    }
  }
}


function getComputerMove() {
  var idx = randomInt(availableMoves.length);
  return availableMoves.splice(idx, 1)[0];
}


function computerTurn() {
  if (gameOver === true) {
    return;
  }

  var move;
  if (targetQueue.length > 0) {
    move = targetQueue.shift();
  } else {
    if (availableMoves.length === 0) return;
    var idx = randomInt(availableMoves.length);
    move = availableMoves.splice(idx, 1)[0];
    targetHits = [];
  }

  var r = move.r;
  var c = move.c;
  var $cell = $('#playerBoard td[data-row="' + r + '"][data-col="' + c + '"]');

  if (playerBoard[r][c] === 1) {
    $cell.addClass('hit');
    var colLetter = String.fromCharCode(65 + c);
    var wasSunk = markShipIfSunk(playerShips, 'playerBoard', playerBoard, r, c);

    if (wasSunk) {
      state.text('Computer versenkt dein Schiff auf ' + colLetter + (r + 1) + '! Er ist nochmal dran...');
      targetQueue = [];
      targetHits = [];
      checkPlayerWin();

      if (gameOver === true) {
        return;
      }
      
      setTimeout(function() {
        computerTurn();
      }, 2000);
    } else {
      state.text('Computer trifft auf ' + colLetter + (r + 1) + '! Er ist nochmal dran...');

      enqueueNeighborsSmart(r, c);
      checkPlayerWin();

      if (gameOver === true) {
        return;
      }

      setTimeout(function() {
        computerTurn();
      }, 2000);
    }
  } else {
    $cell.addClass('miss');
    var colLetter = String.fromCharCode(65 + c);
    state.text('Computer verfehlt auf ' + colLetter + (r + 1) + '. Du bist wieder dran.');
    canPlay = true;
  }
}


function checkPlayerWin() {
  var allSunk = true;

  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if (playerBoard[i][j] === 1) {
        var sel = '#playerBoard td[data-row="' + i + '"][data-col="' + j + '"]';
        var hasHit = $(sel).hasClass('hit');
        var hasSunk = $(sel).hasClass('sunk');
        
        if (!hasHit && !hasSunk) {
          allSunk = false;
        }
      }
    }
  }
  if (allSunk) {
    state.text('Verloren! Der Computer hat gewonnen. 💀');
    $('#computerBoard').off('click', 'td.cell', handleCellClick);

    gameOver = true;

    setTimeout(function() {
      alert('Leider hast du verloren. Versuch es noch einmal!');
    }, 100);
  }
}
