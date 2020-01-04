import $ from 'webpack-zepto'
import {Notification} from './ui/'
import 'clientjs'
export class Account {
  constructor(socket) {
    this.username = null;
    this.email = null;
    this.id = null;
    this.token = null;
    this.socket = socket
    if (this.hasToken()) {
        this.socket.emit('loginToken', JSON.stringify({
          email: localStorage.getItem('po_email'),
          fingerprint: this.getFingerprint(),
          tokenTimestamp: parseInt(localStorage.getItem('po_tokenTimestamp')),
        }));
    } else {
        this.socket.emit('loginToken', JSON.stringify({
          email: localStorage.getItem('po_email'),
          fingerprint: 0,
          tokenTimestamp: 0,
        }));
    }
    $(document).on('login', (event, args) => {
      args.fingerprint = this.getFingerprint()
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
        new Notification("Inscription validée!","success", 3000);
      } else new Notification(res.error,"error", 3000);
    })
    this.socket.on('loginResponse', (res) => {
      res = JSON.parse(res)
      console.log(res);
      if (!res.error) {
        this.username = res.username;
        this.email = res.email;
        localStorage.setItem('po_email', res.email);
        localStorage.setItem('po_token', res.token);
        localStorage.setItem('po_tokenTimestamp', res.tokenTimestamp);
        window.game.ui.setConnected()
        new Notification("Bonjour " + res.username + "!","success", 3000);
      } else if (res.error == "tokeninvalid" ) {
        window.game.ui.createLogin()
      } else new Notification(res.error,"error", 3000);
    })
  }
  hasToken () {
    return localStorage.getItem('po_email') != null &&
        localStorage.getItem('po_token') != null &&
        localStorage.getItem('po_tokenTimestamp') != null
  }
  removeToken () {
    return localStorage.removeItem('po_email') &&
        localStorage.removeItem('po_token') &&
        localStorage.removeItem('po_tokenTimestamp')
  }
  getFingerprint() {
    return new ClientJS().getFingerprint()
  }
}
