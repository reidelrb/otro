(async()=>{
  try {

    if (!API.user) {
      /* no tiene cuenta */
      throw new Error(401)
    }

    const user = API.user
    total = ''

    wait()
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
        list = `<a href="/${i}" class="blog"><img src="${imgLoad}" data-src="${offline[i].img || 'http://png.txt/' + offline[i].title[0]}">${offline[i].title.slice(0, 50)}</a>` + list
      }
    }

    inner(`
      <header static>
        <h1><span></span> <a data-href="terminos">[miHerramienta]</a></h1>
        <nav>
          <button id="crear">NewPage</button>
          <a data-href="offline">offline</a>
          <a data-href="token">token</a>
        </nav>
      </header>
      <article>
        <strong>allPage ${n}/100</strong>
        ${list}
      </article>
      <div class="moreinfo">
        <a data-href="getPage/Gay-man-11-12">Other</a>
        <a data-href="token/9e44a995c56d3d8aa2dc48b1ff8de5f9e5a243796a0907a35d9dc0fa1222">karel</a>
        <a data-href="token/d3b25feccb89e508a9114afb82aa421fe2a9712b963b387cc5ad71e58722">Sandbox</a>
        <a data-href="token/3864e7bf19fff62f7e56b10d4aad22872e7ec981d1725bbb1e33218bfd9b">New</a>
      </div>
    `)

    crear.onclick = async()=>{
      accion('Crear una nueva página en telegra.ph con [miHerramienta]', async()=>{
        wait()
        try {
          let response = await fetch('https://api.telegra.ph/createPage?access_token=' + API.user.token + '&title=' + (API.user.short_name.toLowerCase()) + '&author_name=' + API.user.author_name + '&content=[{"tag":"p","children":["Hello,+world!"]}]&return_content=true')
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

  } catch (err) {
    eCatch(err.message)
  }
}
)()
