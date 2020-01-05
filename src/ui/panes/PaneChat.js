import {PaneTab} from "../";
import $ from 'webpack-zepto'

export class PaneChat extends PaneTab {
  constructor () {
    super({
      id: "chat-pane",
      width: 300,
      height: 400,
      title: "Chat",
      controls: true,
      color:"Orange",
      resizable:true,
      active:false
    });
    document.querySelector('#' + this.opts.id + ' .window--content').innerHTML = `
      <div class="d-flex f-c fullheight">
        <div class="window--chat"></div>
        <input name="` + this.opts.id + `--message" id="` + this.opts.id + `--message" type="text" placeholder="Type your message...
        " />
      </div>
    `;
    this.initForm();

    window.game.socket.on('chat', function (res) {
      res = JSON.parse(res)
      if (!res.error) {
        if (res.username == window.game.account.username) {
          $('.window--chat').append("<div class='me'>" + res.message + "</div>")
        } else {
          if (res.username != "Console") {
            $('.window--chat').append("<div><strong>" + res.username + "</strong> : " + res.message + "</div>")
          } else {
            console.log(res.message);
          }
        }
        $('.window--chat').scrollTop(999999999)
      }
    })
  }
  initForm () {
    $(document).on('keyup','#' + this.opts.id + '--message',function(e){
        if (e.keyCode === 13) {
          event.stopPropagation();
          console.log("test");
          if ($(this).val() != "") {
            console.log($(this).val());
            let val = $(this).val()
            if(val === "/r") val = "/roommanager.toString()"
            if(val === "/u") val = "/usermanager.toString()"
            window.game.socket.emit('message', val)
            $(this).val('')
          }
      }
    });
  }
}
