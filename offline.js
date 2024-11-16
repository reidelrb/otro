(async()=>{
  try {

    let user = api.user || {
      paths: []
    }

    let list = ''
    let n = 0
    for (var i in offline) {
      n++
      off = await mydb.get(i)
      if(off){
        list = `<a data-href="get/${i}" class="blog"><img src="${imgLoad}" data-src="${offline[i].img || imgtext + offline[i].title.slice(0,3)}">${offline[i].title.slice(0, 50)} ${!(user.paths || []).includes(i) ? `<span data-path="${i}" onclick="hDel(this)" class="bi-trash"></span>` : ''}</a>` + list
      }
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
       <h1><a data-href="account" class="bi-arrow-left-square-fill"> offline</a></h1>
       <p>Páginas visitadas para ver sin conexión</p>
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
