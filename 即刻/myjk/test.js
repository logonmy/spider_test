const shuffle = require('knuth-shuffle').knuthShuffle

var a = [1,2,3,4,5,6,7,8]
a = shuffle(a.slice(0));
console.log(a);