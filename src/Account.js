import $ from 'webpack-zepto'

export class Account {
  constructor(socket) {
    this.username = null;
    this.email = null;
    this.id = null;
    this.token = null;
    this.socket = socket
    $(document).on('login', (event, args) => {
      this.socket.emit('login', JSON.stringify(args));
    })
    $(document).on('register', (event, args) => {
      this.socket.emit('register', JSON.stringify(args));
    })
    this.socket.on('registerResponse', function (res) {
      res = JSON.parse(res)
      if (!res.error) {
        console.log(res);
        $(document.body).trigger('closeRegister')
      } else console.log(res.error);
    })
    this.socket.on('loginResponse', function (res) {
      if (res !== "error") {
        console.log(res);
        let json_res = JSON.parse(res)
        this.username = json_res.username;
        this.email = json_res.email;
        window.game.panemanager.setConnected()
      }
    })
  }
}