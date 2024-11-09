((n = (new Date).getHours()) > 17 || n < 7) && document.documentElement.classList.toggle("dark-css");

const imgLoad = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
try {
  eruda.init()
} catch (e) {}

const setCookie = (k,v,t)=>{
  document.cookie = `${encodeURIComponent(k)}=${encodeURIComponent(v)}; path=/; max-age=${(t || 0) * 24 * 60 * 60 * 1000}`
}

const gtk = e=>{
  var t = new Date().getTime();
  return (e || "token-xxxxxxxx").replace(/[xy]/g, function(e) {
    var n = (t + 16 * Math.random()) % 16 | 0;
    return t = Math.floor(t / 16),
    ("x" == e ? n : 3 & n | 8).toString(16)
  })
}

const accion = (t,c,d)=>{
  let i = gtk('rbxxxxxxxxxxx')
  window['accion' + i] = document.createElement('dialog')
  window['accion' + i].className = 'accion'
  window['accion' + i].innerHTML = `<div>${t}</div>${d ? '<button class="more bi-hand-index-thumb-fill"> Opción 2</button>' : ''} ${c ? `<button class="acepta bi-hand-index-thumb-fill"> ${d ? 'Opción 1' : 'Confirmar'}</button>` : ''}<label>×</label>`
  document.body.append(window['accion' + i])
  window['accion' + i].showModal()
  window['accion' + i].querySelector('label').onclick = function() {
    window['accion' + i].remove()
  }
  if (c) {
    window['accion' + i].querySelector('.acepta').onclick = function() {
      c()
      window['accion' + i].remove()
    }
  }
  if (d) {
    window['accion' + i].querySelector('.more').onclick = function() {
      d()
      window['accion' + i].remove()
    }
  }
}
window.alert = accion

function fetchData(url) {
  console.log(url)
  return fetch(url).then(response=>{
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  }
  );
}

const getCookie = (n)=>{
  let matches = document.cookie.match(new RegExp("(?:^|; )" + n.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : null
}
