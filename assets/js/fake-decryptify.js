define(function (require, exports, module) {
  module.exports = {
    decrypt: function(input, options, step, done) {
      var i = 0;
      var time = 0;
      var str = input;

      if(!options || !options.step || !options.done) {
        throw 'Missing options parameter';
        return;
      }

      var changeRate = options.changeRate ? options.changeRate : 75;
      var updateRate = options.updateRate ? options.updateRate : 300;

      // TODO Add linger functionality that occasionally changes random letters
      // var linger = options.linger ? options.linger : false;

      if(updateRate < changeRate) {
        // Flip them
        var temp = updateRate;
        updateRate = changeRate;
        changeRate = temp;
      }

      if(updateRate % changeRate !== 0) {
        // Params don't line up so move changeRate up until it does
        var divide = updateRate / changeRate;
        changeRate = updateRate / Math.round(divide);
        console.log('changeRate doesn\'t divide into updateRate. Setting it to ' + changeRate + ' instead.');
      }

      function change(s, i) {
        time += changeRate;

        if(time % updateRate == 0) {
          // Update word
          i++;
        }

        s = str.substr(0, i) + createCode(str.length - i);

        if(s !== input) {
          options.step(null, s);
          setTimeout(function() {
            change(this.s, this.i);
          }.bind({ s: s, i: i }), changeRate);
        } else {
          return options.done(null, s);
        }
      }

      function createCode(len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=+%^&*()$#@!;\\/<>";

        for(var i = 0; i < len; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
      }

      change(createCode(str.length), i);
    },
  };
});
