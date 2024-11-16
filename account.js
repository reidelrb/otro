(async()=>{
  try {

    if (!api.user) {
      /* no tiene cuenta */
      throw new Error(401)
    }
    const user = api.user
    timeGet = sessionStorage.getItem('timeGet')
    if (!timeGet || Number(timeGet) < 0) {
      try {
        let response = await fetch('https://api.telegra.ph/getAccountInfo?access_token=' + user.token + '&fields=["short_name","author_name","author_url","page_count"]');
        if (response.ok) {
          let data = await response.json()
          console.log(JSON.stringify(data, null, 3))
          if (data.ok) {
            const d = data.result
            user.short_name = d.short_name
            user.author_name = d.author_name
            user.author_url = d.author_url
            user.page_count = d.page_count
          }
        } else {}
      } catch (err) {}

      try {
        let response = await fetch('https://api.telegra.ph/getPageList?access_token=' + user.token + '&limit=100');
        if (response.ok) {
          let data = await response.json()
          if (data.ok) {
            total = data.result.total_count
            sessionStorage.setItem('timeGet', 5);

            let paths = []
            data.result.pages.forEach(p=>{
              offline[p.path] = {
                title: p.title,
                img: p.image_url
              }
              paths.push(p.path)
            }
            )

            user.paths = paths
            await mydb.put('user', user)
            await mydb.put('offline', offline)
          }
        }
      } catch (e) {}

    } else {
      sessionStorage.setItem('timeGet', Number(timeGet) - 1)
    }

    let list = ''
    let n = 0
    for (var i in offline) {
      if ((user.paths || []).includes(i)) {
        n++
        list = `<a data-href="get/${i}" class="blog"><img src="${imgLoad}" data-src="${offline[i].img || imgtext + offline[i].title.slice(0, 3)}">${offline[i].title.slice(0, 50)}</a>` + list
      }
    }

    inner(`
      <header static>
        <h1><span></span> <a data-href="terminos">[miHerramienta]</a></h1>
        <nav>
          <button id="crear">NewPage</button>
          <a data-href="offline">offline</a>
          <a data-href="get/miniblog-11-16">Blog</a>
          <a data-href="token">Login</a>
        </nav>
      </header>
      <article>
        <strong>allPage ${n}/100</strong>
        <p>by ${user.short_name}</p>
        ${list}
      </article>
      <div class="moreinfo">
        <a href="${api.host}404.html">Actualizar version ${version}</a>
      </div>
    `)

    crear.onclick = async()=>{
      accion('Crear una nueva página en telegra.ph con [miHerramienta]', async()=>{
        wait()
        try {
          let response = await fetch('https://api.telegra.ph/createPage?access_token=' + api.user.token + '&title=' + 'blog' + '&author_name=' + api.user.author_name + '&content=[{"tag":"p","children":["Hello,+world!"]}]&return_content=true')
          if (response.ok) {
            let data = await response.json()
            console.log(JSON.stringify(data, null, 3))
            if (data.ok) {
              sessionStorage.setItem('timeGet', -100)
              window.location.reload()
            }
          } else {
            throw new Error(response.status)
          }
        } catch (err) {
          eCatch(err.message)
        }
      }
      )
    }

    n >= 100 && (crear.remove())

  } catch (e) {
    eCatch(e.message)
  }
}
)()
