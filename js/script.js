// load files need for binding based on the presence of touch events

var game = {
  gridSize: 20,

  speed: 300,

  // the direction the head of the snake is moving
  direction: null,

  // draw grid based on grid size
  drawGrid: function(){
    if ( Modernizr.touch ) {
      game.gridSize = 15;
    }

    for (var i = 0; i < game.gridSize; i += 1) {
      $('.grid table').append('<tr></tr>');
    }

    for (var i = 0; i < game.gridSize; i += 1) {
      $('.grid table tr').append('<td></td>');
    }
  },

  // snake object containing body parts with x and y coordinates
  // as well as a list of moves the snake has made since the game started
  // the newest move is first
  snake: {
    bodyParts: [],
    moves: []
  },

  // x and y coordinates of the current treat
  treat: {
    x: null,
    y: null
  },

  specialTreat: {
    x: null,
    y: null
  },

  // method for adding a new snake body or treat
  // also updates the snake and treat objects
  // className can be 'snakeBody' or 'treat' or 'specialTreat'
  add: function(className, x, y) {
    $('.grid table tr:nth-of-type(' + y + ') td:nth-of-type(' + x + ')').addClass(className);

    if (className == 'treat') {
      game.treat.x = x;
      game.treat.y = y;
    } else if (className == 'specialTreat') {
      game.specialTreat.x = x;
      game.specialTreat.y = y;
    } else if (className == 'snakeBody') {
      var newBodyPart = { x: x, y: y };
      game.snake.bodyParts.push(newBodyPart);
    }

  },

  // position the snake in the middle of the grid
  // used when the game starts or is reset
  positionSnake: function(){
    var pos = Math.round(game.gridSize / 2);
    game.add('snakeBody', pos, pos);
    $('.snakeBody').addClass('snakeHead');
  },

  // position the treat at a random place in the grid
  // the position cannot be the position of any of the body parts
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

  positionSpecialTreat: function(){
    var x = randomNumber(1, game.gridSize),
        y = randomNumber(1, game.gridSize);

    game.snake.bodyParts.forEach(function(bodyPart){
      while ( x == bodyPart.x && y == bodyPart.y) {
        x = randomNumber(1, game.gridSize);
        y = randomNumber(1, game.gridSize);
      }
    });

    while ( x == game.treat.x && y == game.treat.y) {
      x = randomNumber(1, game.gridSize);
      y = randomNumber(1, game.gridSize);
    }

    $('.specialTreat').removeClass('specialTreat');
    game.add('specialTreat', x, y);
  },

  // set an interval that triggers methods for moving the whole snake in the direction stored in game.direction
  // clear all intervals every time direction is changed to prevent conflicts
  // every time when moving add the direction to the front of the game.snake.moves array
  // give the first body part a special class as that is the head
  // check if treat has been eaten and if so make a new one, increase the points, and make a new body part
  // check if you're dead and if so restart the game
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

        if ( $('.specialTreat').length > 0 ) {
          game.movesSinceSpecialTreat++;
        }
        if ( game.movesSinceSpecialTreat == 31 ) {
          game.removeSpecialTreat();
        }

        if (game.specialTreatEaten()) {
          game.removeSpecialTreat();
          game.increasePoints('special');
          game.newBodyPart();
        }
        if (game.treatEaten()) {
          game.positionTreat();
          game.increasePoints('normal');
          game.newBodyPart();
        }

        if (game.dead()) {
          game.reset();
        }
      }, game.speed);
    }
  },

  // make a new body at the end of the snake
  // the direction of the last body parts has to be taken into consideration
  newBodyPart: function() {
    var id = game.snake.bodyParts.length - 1,
        lastBodyPart = game.snake.bodyParts[id],
        dir = game.snake.moves[id];
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

  // loop over each body part and move it in the direction the head took when it was in that position
  // so if move[10] is left, move bodyPart[10] to the left
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

  treatsEaten: 0,

  movesSinceSpecialTreat: 0,

  // return true if the head is in the same position as the treat
  treatEaten: function(){
    if (game.snake.bodyParts[0].x == game.treat.x && game.snake.bodyParts[0].y == game.treat.y) {
      game.treatsEaten++;
      if (game.treatsEaten % 20 == 0 ){
        game.positionSpecialTreat();
      }
      return true;
    }

  },

  specialTreatEaten: function(){
    if (game.snake.bodyParts[0].x == game.specialTreat.x && game.snake.bodyParts[0].y == game.specialTreat.y) {
      return true;
    }
  },

  removeSpecialTreat: function(){
    $('.specialTreat').removeClass('specialTreat');
    game.movesSinceSpecialTreat = 0;
  },

  // increase the points pased on the current speed
  increasePoints: function(kindOfTreat) {
    var currentPoints = parseInt($('.points').html()),
        newPoints;

    if ( kindOfTreat == 'normal' ) {
      if ( game.speed == 500 ) {
        newPoints = currentPoints + 1;
        $('.points').html(newPoints);
      } else if ( game.speed == 300 ) {
        newPoints = currentPoints + 2;
        $('.points').html(newPoints);
      } else if ( game.speed == 100 ) {
        newPoints = currentPoints + 3;
        $('.points').html(newPoints);
      } else if ( game.speed == 50 ) {
        newPoints = currentPoints + 4;
        $('.points').html(newPoints);
      }
    } else if ( kindOfTreat == 'special' ) {
      if ( game.speed == 500 ) {
        newPoints = currentPoints + 3;
        $('.points').html(newPoints);

      } else if ( game.speed == 300 ) {
        newPoints = currentPoints + 6;
        $('.points').html(newPoints);

      } else if ( game.speed == 100 ) {
        newPoints = currentPoints + 9;
        $('.points').html(newPoints);

      } else if ( game.speed == 50 ) {
        newPoints = currentPoints + 12;
        $('.points').html(newPoints);
      }
    }

    if ( localStorage.getItem('highscore') < newPoints ) {
      localStorage.setItem('highscore', newPoints);
      $('.highscore').html(newPoints);
    }
  },

  // return true if head is outside the grid
  // or if the head is in the same position as any one of the body parts
  dead: function(){
    var dead = false;

    if (game.snake.bodyParts[0].x > game.gridSize || game.snake.bodyParts[0].x < 0 || game.snake.bodyParts[0].y > game.gridSize || game.snake.bodyParts[0].y < 0) {
      dead = true;
    }

    game.snake.bodyParts.forEach(function(bodyPart, index){
      if (index != 0) {
        if ( game.snake.bodyParts[0].x == bodyPart.x && game.snake.bodyParts[0].y == bodyPart.y ) {
          dead = true;
        }
      }
    });

    return dead;
  },

  // do some setup stuff including setting up binds to change the direction
  setup: function(){
    game.drawGrid();
    game.positionSnake();
    game.positionTreat();

    $('.points').html('0');
    if ( localStorage.getItem('highscore') ) {
      $('.highscore').html(localStorage.getItem('highscore'));
    } else {
      $('.highscore').html(0);
    }

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

    $('.grid table').hammer({ prevent_default: true }).bind('swipe', function(e){
      var direction = e.direction;
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

  // reset the game
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
