import {Game} from './game';
import {Notification} from './ui/'
import $ from 'webpack-zepto'
import css from './css/style.css'
var io = require('socket.io-client');
window.io = io;

window.onload = () => {
  setTimeout(()=>{
    document.querySelector("#loader").remove()
    let io2 = io("http://localhost:8080")
    console.log(io2);
    window.game = new Game(io2);
  },4000);
}
