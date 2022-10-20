export function setRequestAnimationFrame () {
  var vendors = ['webkit', 'moz'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame =
        window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
}
export function AABB (rect1, rect2) {
  return (rect1.x < rect2.x + rect2.width &&
     rect1.x + rect1.width > rect2.x &&
     rect1.y < rect2.y + rect2.height &&
     rect1.height + rect1.y > rect2.y)
}
export function compressRoom(map) {
  let map2 = ''
  let cursor = null
  let counter = 0;
  map.forEach((item, index) => {
    if (cursor !== item) {
      if (counter !== 0) {
        if (counter === 1) {
          map2 += cursor + "."
        } else {
          map2 += counter + "x" + cursor + "."
        }
      }
      cursor = item
      counter = 1
    } else {
      counter ++
    }
    if(index + 1 === map.length) {
      if (counter === 1) {
        map2 += cursor + "."
      } else {
        map2 += counter + "x" + cursor + "."
      }
    }
  })
  return map2.substring(0, map2.length - 1)
}
export function decompressRoom(map) {
  let map2 = map.split('.')
  let mapfinal = []
  map2.forEach((item, index)=> {
    if (item.indexOf('x') === -1) {
      mapfinal.push(parseInt(item))
    } else {
      let tmp = item.split('x')
      for (var i = 0; i < parseInt(tmp[0]); i++) {
        mapfinal.push(parseInt(parseInt(tmp[1])))
      }
    }
  })
  return mapfinal;
}
export function calcul(map) {
  return map.replace(new RegExp("x", 'g'), "*").replace(new RegExp("\\.", 'g'), "+").replace(new RegExp("3", 'g'), "1").replace(new RegExp("x", 'g'), "*").replace(new RegExp("2", 'g'), "1")
}
