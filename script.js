var playerBoard, computerBoard, playerShips, computerShips, state;
var availableMoves = [];
var canPlay = true;


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
  }

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

function canPlace(board, r, c, len, horiz) {
  var size = board.length;
  for (var k = 0; k < len; k++) {
    var x = horiz ? r : r + k;
    var y = horiz ? c + k : c;
    if (x >= size || y >= size || board[x][y] !== 0) {
      return false;
    }
  }
  return true;
}

function placeShips(board) {
  var config = [5, 4, 3, 3, 2]; // Welche Schiffe es gibt und in welcher Größe
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

    if (belongsToThisShip === false) {
      continue;
    }
    
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
    
    if (allHit === true) {
      for (var v = 0; v < ship.length; v++) {
        var rr2 = ship[v].r;
        var cc2 = ship[v].c;
        var sel2 = '#' + boardId + ' td[data-row="' + rr2 + '"][data-col="' + cc2 + '"]';
        $(sel2).removeClass('hit');
        $(sel2).addClass('sunk');

        state.text('Schiff Versenkt! Du darfst nochmal spielen.');
      }
    }

    break;
  }
}

function handleCellClick() {
  if (!canPlay) {
    return;
  }
  
  canPlay = false;

  var $cell = $(this);
  var r = parseInt($cell.attr('data-row'), 10);
  var c = parseInt($cell.attr('data-col'), 10);

  if ($cell.hasClass('hit')) {
    canPlay = true;
    return;
  }

  if ($cell.hasClass('miss')) {
    canPlay = true;
    return;
  }

  if ($cell.hasClass('sunk')) {
    canPlay = true;
    return;
  }

  if (computerBoard[r][c] === 1) {
    $cell.addClass('hit');
    state.text('Treffer! Du darfst nochmal spielen.');

    markShipIfSunk(computerShips, 'computerBoard', computerBoard, r, c);
    canPlay = true;
    
    checkWin();
    
    return;
  } else {
    $cell.addClass('miss');
    state.text('Wasser! Computer ist dran...');

    window.setTimeout(function() {
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
        var hasHit  = $(sel).hasClass('hit');
        var hasSunk = $(sel).hasClass('sunk');
        
        if (hasHit === false && hasSunk === false) {
          allSunk = false;
        }
      }
    }
  }

  if (allSunk) {
    state.text('Du hast gewonnen! 🎉');
    $('#computerBoard').off('click', 'td.cell', handleCellClick);
  }
}

function renderPlayerShips() {
  for (var s = 0; s < playerShips.length; s++) {
    var ship = playerShips[s];
    for (var i = 0; i < ship.length; i++) {
      var cell = ship[i];
      $('#playerBoard td[data-row="' + cell.r + '"][data-col="' + cell.c + '"]')
        .addClass('ship');
    }
  }
}

function getComputerMove() {
  var idx = randomInt(availableMoves.length);
  var move = availableMoves.splice(idx, 1)[0];
  return move;
}

function computerTurn() {
  if (availableMoves.length === 0) {
    return;
  }

  var idx = randomInt(availableMoves.length);
  var move = availableMoves.splice(idx, 1)[0];
  var r = move.r;
  var c = move.c;

  var $cell = $('#playerBoard td[data-row="' + r + '"][data-col="' + c + '"]');

  if (playerBoard[r][c] === 1) {
    $cell.addClass('hit');

    var colLetter = String.fromCharCode(65 + c);
    state.text('Computer trifft auf ' + colLetter + (r + 1) + '!');

    markShipIfSunk(playerShips, 'playerBoard', playerBoard, r, c);
  } else {
    $cell.addClass('miss');

    var colLetter = String.fromCharCode(65 + c);
    state.text('Computer verfehlt auf ' + colLetter + (r + 1) + '!');
  }

  checkPlayerWin();

  canPlay = true;
}

function checkPlayerWin() {
  var allSunk = true;
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if (playerBoard[i][j] === 1) {
        var sel = '#playerBoard td[data-row="' + i + '"][data-col="' + j + '"]';
        var hasHit  = $(sel).hasClass('hit');
        var hasSunk = $(sel).hasClass('sunk');
        if (hasHit === false && hasSunk === false) {
          allSunk = false;
        }
      }
    }
  }
  if (allSunk) {
    state.text('Verloren! Der Computer hat gewonnen. 💀');
    $('#computerBoard').off('click', 'td.cell', handleCellClick);
  }
}
