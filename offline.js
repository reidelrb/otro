(async()=>{
  try {

    let user = API.user || {
      paths: []
    }

    let list = ''
    let n = 0
    for (var i in offline) {
      n++
      list = `<a href="/${i}" class="blog"><img src="${imgLoad}" data-src="${offline[i].img || 'http://png.txt/' + offline[i].title[0]}">${offline[i].title.slice(0, 50)} ${!(user.paths || []).includes(i) ? `<span data-path="${i}" onclick="hDel(this)" class="bi-trash"></span>` : ''}</a>` + list
    }

    hDel = async(o)=>{
      event.stopPropagation()
      event.preventDefault()
      let path = o.dataset.path
      accion('Eliminar "' + path + '" del historial', async()=>{
        o.parentNode.remove()
        delete offline[path]
        await mydb.put('offline', offline)
        await mydb.delete(path)
      }
      )
    }

    inner(`
      <header static>
        <a data-href="account"><h1 class="bi-arrow-left-square-fill"> offline</h1></a>
      </header>
      <article>
        ${list}
      </article>
    `)

  } catch (err) {
    eCatch(err.message)
  }
}
)()
