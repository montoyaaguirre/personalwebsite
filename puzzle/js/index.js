define("viewing/board-widget",[],function(){"use strict";function e(e){for(var t=0;t<e.length;t++){var n="piece"+e[t];document.getElementById(n).setAttribute("data-order",t.toString())}}function t(e,t,n){var i=n*n,a=document.getElementById(e);a.className+=" side"+n;for(var o=0;o<i;o++){var s=o%n,u=Math.floor(o/n),c=document.createElement("div"),d=document.createElement("img");c.setAttribute("id","piece"+o),c.setAttribute("data-order","i"),c.setAttribute("class","piece col"+s+" row"+u),d.setAttribute("src",t),d.setAttribute("data-piece",o),d.setAttribute("onmousedown","return false;"),o!==i-1&&c.appendChild(d),r&&c.addEventListener("click",function(e){r(e.target.getAttribute("data-piece"))},!1),a.appendChild(c)}}function n(e){e&&(r=e)}var r;return{render:t,setPieceOrder:e,setClickCallback:n}}),define("utils",[],function(){"use strict";function e(e){for(var t=e.length-1;t>0;t--){var n=Math.floor(Math.random()*(t+1)),r=e[t];e[t]=e[n],e[n]=r}}function t(e,t,n){var r=e.indexOf(t),i=e.indexOf(n);e[r]=n,e[i]=t}return{shuffleArray:e,swapElements:t}}),define("data-models/puzzle",["../utils"],function(e){"use strict";function t(t,n){function r(){return u}function i(t){t&&a(t)&&e.swapElements(u,t,s)}function a(e){return-1!==o(e).indexOf(s)}function o(e){var n=[];e=u.indexOf(e);var r=Math.sqrt(t);return e>=r&&n.push(u[e-r]),(e+1)%r!=0&&n.push(u[e+1]),e<r*(r-1)&&n.push(u[e+r]),e%r!=0&&n.push(u[e-1]),n}var s,u=[];return function(t,n){n=void 0===n||n,9!==t&&16!==t&&25!==t&&(console.log("The puzzle must contain 9, 16 or 25 pieces."),t=16),s=t-1;for(var r=0;r<t;r++)u.push(r);n&&e.shuffleArray(u)}(t,n),{getPieces:r,_getNeighbors:o,checkIfMovable:a,move:i}}return t}),define("index",["./viewing/board-widget","./data-models/puzzle"],function(e,t){"use strict";function n(t){r.move(parseInt(t)),e.setPieceOrder(r.getPieces())}document.getElementById("app").innerHTML="<h1>ES5 CSS</h1>",e.setClickCallback(n),e.render("board","https://montoyalabs.com/images/monks.jpg",4);var r=new t(16,!1);e.setPieceOrder(r.getPieces())});