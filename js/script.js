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
    y: null,
    bodyParts: []
  },

  treat: {
    x: null,
    y: null
  },

  position: function(className, x, y) {
    if (className != 'snakeBody') {
      $('.' + className).removeClass(className);
    }

    $('.grid table tr:nth-of-type(' + y + ') td:nth-of-type(' + x + ')').addClass(className);

    if (className == 'snakeHead') {
      game.snake.x = x;
      game.snake.y = y;
    } else if (className == 'treat') {
      game.treat.x = x;
      game.treat.y = y;
    } else if (className == 'snakeBody') {
      var newBodyPart = { x: x, y: y };
      game.snake.bodyParts.push(newBodyPart);
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

    if ( game.snake.bodyParts.length > 0 ) {
      game.snake.bodyParts.forEach(function(bodyPart){
        while ( x == bodyPart.x && y == bodyPart.y) {
          x = randomNumber(1, game.gridSize);
          y = randomNumber(1, game.gridSize);
        }
      });
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

          game.newBodyPart();
        }
        if (game.dead()) {
          game.reset();
        }
      }, game.speed);
    }
  },

  newBodyPart: function() {
    if (game.direction == 'up') {
      game.position('snakeBody', game.snake.x, game.snake.y + 1);

    } else if (game.direction == 'down') {
      game.position('snakeBody', game.snake.x, game.snake.y - 1);

    } else if (game.direction == 'right') {
      game.position('snakeBody', game.snake.x - 1, game.snake.y);

    } else if (game.direction == 'left') {
      game.position('snakeBody', game.snake.x + 1, game.snake.y);

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
    var die = false;

    if (game.snake.x > game.gridSize || game.snake.x < 0 || game.snake.y > game.gridSize || game.snake.y < 0) {
      die = true;
    }

    game.snake.bodyParts.forEach(function(bodyPart){
      if ( game.snake.x == bodyPart.x && game.snake.y == bodyPart.y ) {
        die = true;
      }
    });

    return die;
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
    game.snake.bodyParts = [];
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

  var paused = false;
  $('.pause').click(function(){
    if (!paused) {
      $(this).html('Unpause');
      for (var i = 0; i < 9999; i += 1) {
        window.clearInterval(i);
      }
      paused = true;
    } else {
      $(this).html('Pause');
      game.move();
      paused = false;
    }
  });

});
