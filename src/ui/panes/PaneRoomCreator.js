import {Pane} from "../";
import $ from 'webpack-zepto'

export class PaneRoomCreator extends Pane {
  constructor () {
    super({
      id: "roomcreator-pane",
      width: 300,
      height: 340,
      title: "Rooms creator",
      controls: true,
      active:false
    });
    document.querySelector('#' + this.opts.id + ' .window--content').innerHTML = `
      <div class="window--marsins">
      <ul class="rooms">
        <li>
          <span>Title</span>
          <span>2/10</span>
        </li>
        <li>
          <span>Title</span>
          <span>2/10</span>
        </li>
        <li>
          <span>Title</span>
          <span>2/10</span>
        </li>
        <li>
          <span>Title</span>
          <span>2/10</span>
        </li>
      </ul>
      <button class="createroom">CREATE</button>
      </div>
    `;
  }
  toggleActive () {
    this.opts.active = !this.opts.active;
    $("#" + this.opts.id).toggle()
  }
}
