import $ from 'webpack-zepto'

export class PaneButton {
  constructor(id, icon, active, color) {
    this.active = false;
    this.opts = {}
    this.opts.id = id + "-button" || "undefined-button";
    this.opts.paneId = id + "-pane" || "undefined-pane";
    this.opts.icon = icon || "none";
    this.opts.color = color || "Blue";
    let elem = `<button id="` + this.opts.id + `" style="filter:hue-rotate(` + this.setColor(this.opts.color) + `deg)" class="button-tab button-tab--` + this.opts.icon + `"></button>`;
    $('#button-tabs').append(elem);
    this.elem = document.querySelector('#' + this.opts.id)
    $(document).on('click','#' + this.opts.id, event => {
      event.stopPropagation();
      $(document.body).trigger('togglePane', {id:this.opts.paneId, btnId:this.opts.id})
    })
  }
  toggleActive () {
    this.opts.active = !this.opts.active;
    $("#" + this.opts.id).toggleClass('active')
  }
  destroy () {
    $('#' + this.opts.id).remove()
  }
  setColor (color) {
    switch(color) {
      case "Green":
        return 205;
      break;
      case "Red":
        return 115;
      break;
      case "Orange":
        return 145;
      break;
      case "Violet":
        return 30;
      break;
      case "Pink":
        return 60;
      break;
      case "Indigo":
        return 285;
      break;
      default:
        return 0;
      break;
    }
  }
}
