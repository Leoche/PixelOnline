import $ from 'webpack-zepto'

export class PaneExitButton {
  constructor() {
    this.active = false;
    this.opts = {}
    let id = "exit"
    let paneId = "exit"
    let icon = "exit"
    this.opts.id = id + "-button" || "undefined-button";
    this.opts.paneId = id + "-pane" || "undefined-pane";
    this.opts.icon = icon || "none";
    let elem = `<button id="` + this.opts.id + `" class="button-tab button-tab--` + this.opts.icon + `"></button>`;
    $('#button-tabs').append(elem);
    this.elem = document.querySelector('#' + this.opts.id)
    $(document).on('click','#' + this.opts.id, event => {
      event.stopPropagation();
      $(document.body).trigger('disconnect')
    })
  }
  destroy () {
    $('#' + this.opts.id).remove()
  }
}
