var playerBoard, computerBoard, playerShips, computerShips, state;


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

function handleCellClick() {
  var $cell = $(this);
  var r = parseInt($cell.attr('data-row'), 10);
  var c = parseInt($cell.attr('data-col'), 10);

  if ($cell.hasClass('hit') || $cell.hasClass('miss')) {
    return;
  }

  if (computerBoard[r][c] === 1) {
    $cell.addClass('hit');
    state.text('Treffer!');
  } else {
    $cell.addClass('miss');
    state.text('Wasser!');
  }
  checkWin();
}

function checkWin() {
  var allSunk = true;
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if (computerBoard[i][j] === 1 &&
          !$('#computerBoard td[data-row="' + i + '"][data-col="' + j + '"]').hasClass('hit')) {
        allSunk = false;
      }
    }
  }
  
  if (allSunk) {
    state.text('Du hast gewonnen! 🎉');
    $('#computerBoard').off('click', 'td.cell', handleCellClick);
  }
}
