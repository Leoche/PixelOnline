import {Sprite, SpriteSheet, IsoSprite, Player, Ball, BallBis, BallMini} from '../';
import {Point, Pathfinder} from '../../utils/math';
import {compressRoom, decompressRoom, calcul} from '../../utils/helpers';
export class Room {
  constructor(game, room) {
    this.infos = room
    this.game = game
    this.map = decompressRoom(room.map);
    this.floor = new SpriteSheet(document.querySelector('#img-floors'), 0, 0, 64, 32)
    this.floor.setFrame(3)
    this.player = new IsoSprite(document.querySelector('#img-ball'), 0, 0)
    this.widthTile = room.width;
    this.heightTile = room.height;
    this.width = (this.widthTile + this.heightTile) * this.floor.width / 2;
    this.height = (this.widthTile + this.heightTile) * this.floor.height / 2;
    this.x = game.renderer.canvas.width / 2 - this.width / 2
    this.y = game.renderer.canvas.height / 2 - this.height / 2
    this.cursor = new IsoSprite(document.querySelector('#img-cursor'), 0, 0, this)
    this.entities = []
    this.paths = []
    this.infos.users.forEach(user => {
      user.sprite = new IsoSprite(document.querySelector('#img-ball'), user.x, user.y, this)
    })
    //this.createPath()
    game.socket.on('usersUpdate', data => {
      data = JSON.parse(data)
      data.users.forEach(newUser => {
        let found = false
        this.infos.users.forEach((user, i) => {
          if(user._id === newUser._id) {
            this.infos.users[i].sprite.setIsoXY(newUser.x, newUser.y)
            found = true
          }
        })
        if (!found) {
          newUser.sprite = new IsoSprite(document.querySelector('#img-ball'), newUser.x, newUser.y, this)
          this.infos.users.push(newUser)
        }
      })
    })
    game.socket.on('userLeave', data => {
      data = JSON.parse(data)
      this.infos.users.forEach((user, i) => {
        if(user._id === data.id) {
          this.infos.users.splice(i, 1)
        }
      })
    })
  }
  setCursor (point) {
    if (point.x >= 0 &&
        point.x < this.widthTile &&
        point.y >= 0 &&
        point.y < this.heightTile){
          if (this.map[point.y * this.heightTile + point.x] > 0) {
            this.cursor.setIsoXY(point.x, point.y)
            this.cursor.setVisible(true)
          } else {
            this.cursor.setIsoXY(-1, -1)
            this.cursor.setVisible(false)
          }
    } else {
      this.cursor.setIsoXY(-1, -1)
      this.cursor.setVisible(false)
    }
  }
  createPath () {
    let p = new Pathfinder(this.getMap2d()).findPath(this.start.isoY, this.start.isoX, this.end.isoY, this.end.isoX, 1000)
    if(p !== false)
    p.forEach(step => {
      if ((step.x !== this.start.isoY || step.y !== this.start.isoX) && (step.x !== this.end.isoY || step.y !== this.end.isoX))
        this.paths.push(new BallMini(step.y, step.x, this))
    })
  }
  onClick () {
    this.game.socket.emit('move', JSON.stringify({x: this.cursor.isoX, y: this.cursor.isoY}))
    // this.map[this.cursor.isoX * this.heightTile + this.cursor.isoY] = (this.map[this.cursor.isoX * this.heightTile + this.cursor.isoY] !== 1) ? 1 : 2;
    // if (this.cursor.visible) {
    //   this.paths = []
    //   //this.start.setIsoXY(this.cursor.isoX, this.cursor.isoY)
    //   this.createPath()
    // }
  }
  getMap2d () {
    let map2d = [];
    for (var i = 0; i < this.widthTile; i++) {
      for (var j = 0; j < this.heightTile; j++) {
        if (!map2d[i]) map2d[i] = []
        map2d[i][j] = this.map[i * this.heightTile + j]
      }
    }
    return map2d
  }
  update () {
    this.cursor.update()
    this.infos.users.forEach(user => user.sprite.update())
  }
  render (ctx) {
    for (var i = 0; i < this.widthTile; i++) {
      for (var j = 0; j < this.heightTile; j++) {
        if (this.map[i * this.heightTile + j] === 3) {
          this.floor.setFrame(0)
        } else if (this.map[i * this.heightTile + j] === 2){
          this.floor.setFrame(3)
        } else {
          this.floor.setFrame(1)
        }
        this.floor.x = this.x + (this.heightTile * this.floor.width / 2 - this.floor.width / 2) - (i - j) * this.floor.width / 2
        this.floor.y = this.y + (i + j) * this.floor.height / 2
        this.floor.render(ctx)
      }
    }
    this.cursor.render(ctx, this)
    this.infos.users.forEach(user => user.sprite.render(ctx, this))
  }
}
