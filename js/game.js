var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'canvas');

game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.start('menu');