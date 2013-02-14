function log(a) { console.log(a); }
function randomNumber(from,to) { return Math.floor(Math.random()*(to-from+1)+from); }

var game = {
  gridSize: 15,

  drawGrid: function(){
    for (var i = 0; i < game.gridSize; i += 1) {
      $('.grid table').append('<tr></tr>');
    }

    for (var i = 0; i < game.gridSize; i += 1) {
      $('.grid table tr').append('<td></td>');
    }
  },

  snake: {
    x: null,
    y: null
  },

  treat: {
    x: null,
    y: null
  },

  position: function(className, x, y) {
    $('.' + className).removeClass(className);

    $('.grid table tr:nth-of-type(' + y + ') td:nth-of-type(' + x + ')').addClass(className);

    if (className == 'snakeHead') {
      game.snake.x = x;
      game.snake.y = y;
    } else if (className == 'treat') {
      game.treat.x = x;
      game.treat.y = y;
    }
  },

  positionSnake: function(){
    var pos = Math.round(game.gridSize / 2);
    game.position('snakeHead', pos, pos);
  },

  positionTreat: function(){
    var x = randomNumber(1, game.gridSize),
    y = randomNumber(1, game.gridSize);

    while ( x == game.snake.x && y == game.snake.y) {
      x = randomNumber(1, game.gridSize);
      y = randomNumber(1, game.gridSize);
    }

    game.position('treat', x, y);
  },

  speed: 300,

  direction: null,

  move: function() {
    if (game.direction) {
      for (var i = 0; i < 9999; i += 1) {
        window.clearInterval(i);
      }
      var movement = window.setInterval(function(){
        if (game.direction == 'up') {
          game.position('snakeHead', game.snake.x, game.snake.y - 1);

        } else if (game.direction == 'down') {
          game.position('snakeHead', game.snake.x, game.snake.y + 1);

        } else if (game.direction == 'left') {
          game.position('snakeHead', game.snake.x - 1, game.snake.y);

        } else if (game.direction == 'right') {
          game.position('snakeHead', game.snake.x + 1, game.snake.y);
        }

        if (game.treatEaten()) {
          game.positionTreat();
          game.increasePoints();
        }
        if (game.dead()) {
          game.reset();
        }
      }, game.speed);
    }
  },

  treatEaten: function(){
    if (game.snake.x == game.treat.x && game.snake.y == game.treat.y) {
      return true;
    }
  },

  increasePoints: function() {
    var currentPoints = parseInt($('.points').html());
    if ( game.speed == 500 ) {
      $('.points').html( currentPoints + 1 );
    } else if ( game.speed == 300 ) {
      $('.points').html( currentPoints + 2 );
    } else if ( game.speed == 100 ) {
      $('.points').html( currentPoints + 3 );
    } else if ( game.speed == 50 ) {
      $('.points').html( currentPoints + 4 );
    }
  },

  dead: function(){
    if (game.snake.x > game.gridSize || game.snake.x < 0 || game.snake.y > game.gridSize || game.snake.y < 0) {
      return true;
    }
  },

  setup: function(){
    game.drawGrid();
    game.positionSnake();
    game.positionTreat();
    $('.points').html('0');

    // game.direction = 'right';
    // game.move();

    Mousetrap.bind(['up', 'down', 'right', 'left'], function(e){
      var direction = e.keyIdentifier.toLowerCase();

      if (direction == 'down' && game.direction == 'up') {
        return;
      } else if (direction == 'up' && game.direction == 'down') {
        return;
      } else if (direction == 'left' && game.direction == 'right') {
        return;
      } else if (direction == 'right' && game.direction == 'left') {
        return;
      }

      game.direction = direction;
      game.move();
    });
  },

  reset: function(){
    $('.grid table').html('');
    game.direction = null;
    game.setup();
  }
}

$(function(){

  game.setup();

  $('select#change_speed').change(function(){
    game.speed = $(this).val();
    $(this).blur();
    game.reset();
  });

});

/* TODO list
 * make snake longer when treat eaten
 * move the body of the snake when moving
 * die when the head hits the body
 */
