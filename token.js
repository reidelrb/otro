(async()=>{
  try {

    if (api.user) {
      document.body.innerHTML = addName(`
          <server>
            <div>
              <a data-href="account"><h1>[miHerramienta]</h1></a>
              <p>${api.user.short_name} Guarde su link de activación en un lugar seguro para iniciar sesión nuevamente <b onclick="copyTo(api.host+'token/'+api.user.token)">CopyLink</b></p>
              <button onclick="(async()=>{await mydb.delete('user') ;window.location.reload()})() ">Cerrar sesión</button>
              <button onclick="copyTo(api.user.token)">CopyToken</button>
            </div>
          </server>
      <div class="moreinfo">
        <a data-href="account">Account</a>
        <a data-href="offline">offLine</a>
      </div>
      `)
      urls()
    } else {
      if (api.content) {

        try {
          let response = await fetch('https://api.telegra.ph/getAccountInfo?access_token=' + api.content + '&fields=["short_name","author_name","author_url","page_count"]');
          if (response.ok) {
            let data = await response.json()
            console.log(JSON.stringify(data, null, 3))
            if (data.ok) {
              sessionStorage.setItem('timeGet', -100)
              await mydb.put('user', {
                token: api.content
              })
              window.location.reload()
              APIURL('account')
            } else {
              throw new Error(data.error)
            }
          } else {
            throw new Error(response.status)
          }
        } catch (err) {
          eCatch(err.message)
        }

      } else {
        document.body.innerHTML = addName(`
          <server>
            <div>
              <a data-href="account"><h1>[miHerramienta]</h1></a>
              <p>
                El token de <a href="//telegra.ph">telegraph</a> es como una llave que te identifica 
                como el dueño de la cuenta para crear y editar contenido
              </p>
              <label onclick="accion(terminos,()=>{condiciones.checked=true})" class="accepto"><input id="condiciones" disabled type="checkbox">Acepto las condiciones del servicio</label>
              <button id="crear">Crear Token</button>
            </div>
          </server>
      <div class="moreinfo">
        <a data-href="terminos">Terminos</a>
        <a data-href="offline">offLine</a>
      </div>
        `)
        urls()
        crear.onclick = async()=>{
          if (condiciones.checked) {
            try {
              wait()
              let response = await fetch('https://api.telegra.ph/createAccount?short_name=' + gtk('xxxxxx') + '&author_name=Creado desde [miHerramienta] para telegra.ph');
              if (response.ok) {
                let data = await response.json()
                console.log(JSON.stringify(data, null, 3))
                if (data.ok) {
                  sessionStorage.setItem('timeGet', -100)
                  await mydb.put('user', {
                    token: data.result.access_token
                  })
                  APIURL('account')
                } else {
                  throw new Error(data.error)
                }
              } else {
                throw new Error(response.status)
              }
            } catch (err) {
              eCatch(400)
            }
          } else {
            alert('Debe leer y aceptar nuestras condiciones')
          }
        }
      }
    }

  } catch (err) {
    eCatch(err.message)
  }
}
)()
