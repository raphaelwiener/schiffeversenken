$(document).ready(function() {
  console.log('Schiffe Versenken: Projektinitialisierung abgeschlossen');

  createGrid($('#playerBoard'));
  createGrid($('#computerBoard'));
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
