import {Pane} from "../";
import $ from 'webpack-zepto'

export class PaneRoomCreator extends Pane {
  constructor () {
    super({
      id: "roomcreator-pane",
      width: 400,
      height: 340,
      title: "Rooms creator",
      color:"Red",
      controls: true,
      active:true
    });
    document.querySelector('#' + this.opts.id + ' .window--content').innerHTML = `
      <div class="window--marsins">
      <label class="fullwidth noselect" for="` + this.opts.id + `--name">Room name:</label>
      <input name="` + this.opts.id + `--name" type="text" placeholder="Room name" value=""/>
      <button class="` + this.opts.id + `--create">CREATE</button>
      </div>
    `;
    $(document).on('click', `.` + this.opts.id + `--create`, event => {
      console.log(5)
      let credentials = {
        name: $('input[name=' + this.opts.id + '--name]').val()
      }
      window.game.socket.emit('createRoom', JSON.stringify(credentials));
    })
  }
  toggleActive () {
    this.opts.active = !this.opts.active;
    $("#" + this.opts.id).toggle()
  }
}
