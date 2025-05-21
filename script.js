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

  
}
