var game = {
  gridSize: 15,

  speed: 300,

  direction: null,

  drawGrid: function(){
    for (var i = 0; i < game.gridSize; i += 1) {
      $('.grid table').append('<tr></tr>');
    }

    for (var i = 0; i < game.gridSize; i += 1) {
      $('.grid table tr').append('<td></td>');
    }
  },

  snake: {
    bodyParts: [],
    moves: []
  },

  treat: {
    x: null,
    y: null
  },

  add: function(className, x, y) {
    $('.grid table tr:nth-of-type(' + y + ') td:nth-of-type(' + x + ')').addClass(className);

    if (className == 'treat') {
      game.treat.x = x;
      game.treat.y = y;
    } else if (className == 'snakeBody') {
      var newBodyPart = { x: x, y: y };
      game.snake.bodyParts.push(newBodyPart);
    }

  },

  positionSnake: function(){
    var pos = Math.round(game.gridSize / 2);
    game.add('snakeBody', pos, pos);
    $('.snakeBody').addClass('snakeHead');
  },

  positionTreat: function(){
    var x = randomNumber(1, game.gridSize),
        y = randomNumber(1, game.gridSize);

    game.snake.bodyParts.forEach(function(bodyPart){
      while ( x == bodyPart.x && y == bodyPart.y) {
        x = randomNumber(1, game.gridSize);
        y = randomNumber(1, game.gridSize);
      }
    });

    $('.treat').removeClass('treat');
    game.add('treat', x, y);
  },

  move: function() {
    if (game.direction) {
      for (var i = 0; i < 9999; i += 1) {
        window.clearInterval(i);
      }
      var movement = window.setInterval(function(){

        game.snake.moves.unshift( game.direction );

        game.moveBody();

        var head = game.snake.bodyParts[0];
        $('.snakeHead').removeClass('snakeHead');
        $('.grid table tr:nth-of-type(' + head.y + ') td:nth-of-type(' + head.x + ')').addClass('snakeHead');

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
    var id = game.snake.bodyParts.length - 1;

    var lastBodyPart = game.snake.bodyParts[id];

    var dir = game.snake.moves[id];

    if (dir == 'up') {
      game.add('snakeBody', lastBodyPart.x, lastBodyPart.y + 1);

    } else if (dir == 'down') {
      game.add('snakeBody', lastBodyPart.x, lastBodyPart.y - 1);

    } else if (dir == 'right') {
      game.add('snakeBody', lastBodyPart.x - 1, lastBodyPart.y);

    } else if (dir == 'left') {
      game.add('snakeBody', lastBodyPart.x + 1, lastBodyPart.y);
    }
  },

  moveBody: function() {
    $('.snakeBody').removeClass('snakeBody');

    game.snake.bodyParts.forEach(function(bodyPart, id){
      var dir = game.snake.moves[id];

      function moveTo(x, y) {
        $('.grid table tr:nth-of-type(' + y + ') td:nth-of-type(' + x + ')').addClass('snakeBody');
        game.snake.bodyParts[id].x = x;
        game.snake.bodyParts[id].y = y;
      }

      if (dir == 'up') {
        moveTo(bodyPart.x, bodyPart.y - 1);
      } else if (dir == 'down') {
        moveTo(bodyPart.x, bodyPart.y + 1);
      } else if (dir == 'right') {
        moveTo(bodyPart.x + 1, bodyPart.y);
      } else if (dir == 'left') {
        moveTo(bodyPart.x - 1, bodyPart.y);
      }
    });
  },

  treatEaten: function(){
    if (game.snake.bodyParts[0].x == game.treat.x && game.snake.bodyParts[0].y == game.treat.y) {
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

    if (game.snake.bodyParts[0].x > game.gridSize || game.snake.bodyParts[0].x < 0 || game.snake.bodyParts[0].y > game.gridSize || game.snake.bodyParts[0].y < 0) {
      die = true;
    }

    game.snake.bodyParts.forEach(function(bodyPart, index){
      if (index != 0) {
        if ( game.snake.bodyParts[0].x == bodyPart.x && game.snake.bodyParts[0].y == bodyPart.y ) {
          die = true;
        }
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

});
