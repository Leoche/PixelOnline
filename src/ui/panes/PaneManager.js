import {Pane, PaneButton, PaneLogin, PaneRegister, PaneTab, PaneChat, PaneRooms, PaneRoomCreator} from "../";
import interact from "interactjs";
import $ from 'webpack-zepto'

export class PaneManager {
  constructor () {
    this.panes = [];
    this.buttons = [];
    this.z = 1000;
    $(document).on('closePane', (event, args) => {
      if (this.get('panes', args.id) instanceof PaneTab) {
        this.get('panes', args.id).toggleActive();
        let btnId = this.get('panes', args.id).opts.btnId;
        this.get('buttons', btnId).toggleActive();
      } else {
        this.remove('panes', args.id);
      }
      console.log("closePane");
    })
    $(document).on('togglePane', (event, args) => {
      this.get('panes', args.id).toggleActive();
      this.get('buttons', args.btnId).toggleActive();
    })
    $(document).on('openPane', (event, args) => {
      this.get('panes', args.id).toggleActive();
      this.get('buttons', args.btnId).toggleActive();
    })
    interact(".window").on('down', (event) => {
      this.setOnTop(event.currentTarget.id)
    });
    interact(".draggable").draggable({
      allowFrom: '.window--snap',
      onmove: event => {
        var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    });
    interact(".resizable").resizable({
      allowFrom: '.window--resize',
      edges: { left: false, right: '.window--resize', bottom: '.window--resize', top: false }
    })
    interact(".resizable").on('resizemove', function (event) {
      var target = event.target;

    // add the change in coords to the previous width of the target element
    var
      newWidth  = parseFloat(target.style.width ) + event.dx,
      newHeight = parseFloat(target.style.height) + event.dy;

    // update the element's style
    target.style.width  = newWidth + 'px';
    target.style.height = newHeight + 'px';
    });
  }
  createLogin() {
    console.log("de");
    let pane = new PaneLogin();
    this.panes.push(pane)
    $(document).on('openRegister', event => {
      this.get('panes', 'login-pane').toggleActive();
      this.createRegister();
    })
  }
  createExample(id) {
    let pane = new Pane({id:id, title:id});
    this.panes.push(pane)
  }
  createRegister() {
    let pane = new PaneRegister()
    this.panes.push(pane)
    this.reOrder()

    $(document).one('closeRegister', event => {
      this.remove('panes', 'register-pane');
      this.get('panes', 'login-pane').toggleActive();
    })
  }
  setOnTop(paneId) {
    let id = null
    this.panes.forEach((pane, index) => {
      if (pane.opts.id === paneId) id = index
    })
    let pane = this.panes.splice(id, 1)
    this.panes.push(pane[0])
    this.reOrder()
  }
  reOrder() {
    this.panes.forEach((pane, i) => {
      $('#' + pane.opts.id).css('z-index', this.z + i)
    })
  }
  setConnected() {
    this.remove('panes', 'login-pane')
    let button = new PaneButton('chat', 'chat')
    let pane = new PaneChat()
    this.panes.push(pane)
    this.buttons.push(button)
    button = new PaneButton('rooms', 'rooms')
    pane = new PaneRooms()
    this.panes.push(pane)
    this.buttons.push(button)
    this.reOrder()
    pane = new PaneRoomCreator();
    this.panes.push(pane)
    $(document).on('openRoomCreator', event => {
      console.log(5);
      this.get('panes', 'roomcreator-pane').toggleActive();
    })
  }
  remove (type, id) {
    this[type].forEach((item, i) => {
      if(item.id === id || item.opts.id === id) {
        item.destroy()
        this.panes.splice(i, 1)
      }
    })
  }
  get (type, id) {
    let res = null;
    this[type].forEach(item => {
      if(item.opts.id === id) res = item
    })
    return res;
  }
}
