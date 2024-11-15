searchImage=async(i)=>{
  const cx = "4416977100c5544ee"

  if(!api.user.cse_tok){
    document.body.innerHTML =`
      <server>
        <h1>Cargando...</h1>
        <p>Espere mientras se crea un nuevo buscador...</p>
        <div id="mcaptcha" class="g-recaptcha" data-callback="captcha" data-sitekey="6LdE6qgbAAAAANq2Tal4NuP8YdGwtfdTpCLArNE-"></div>
        <div class="hide">
          <div class="gcse-searchresults-only">...</div>
        </div>
      </server>
    `
        console.log('buscando token...')
        async function handleNewScript(g) {
            let k = (new URLSearchParams((new URL(g.src)).search))
            if (k.get('cse_tok')) {
              api.user.cse_tok = k.get('cse_tok')
              api.user.cselibv = k.get('cselibv')
              console.log('Token New in: ',g.src)
              await mydb.put('user',api.user)
              history.replaceState({page:'new'}, '', api.host + api.path);
              window.location.reload()
            }
          }
          const observer = new MutationObserver(mutations=>{
            mutations.forEach(mutation=>{
              mutation.addedNodes.forEach(node=>{
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT' && (new URLSearchParams((new URL(node.src)).search)).get('cse_tok')) {
                  handleNewScript(node);
                }
              });
            });
          });
          observer.observe(document, {
            childList: true,
            subtree: true
          });
         
          window.location.hash = "#gsc.q=hola+mundo"
       x = await new Promise((resolve,reject)=>{
          e = document.createElement('script')
          e.src = "https://cse.google.com/cse.js?cx=" + cx
          e.onload = ()=>resolve(true)
          e.onerror = ()=>resolve(false)
          document.head.append(e)
        })
        
        if(!x){
          window.location.reload()
        }

        e.remove()
        return true
  }


  useThisImage = (i)=>{
    espere(true)
    f = new Image()
    f.src = i.dataset.url
    f.alt = i.alt
    console.log(i.dataset.url)
    f.onload=async function(){
      espere()
        image[this.src] = this.alt
        a_select.querySelector('img').src = this.src
        a_select.querySelector('figcaption').innerHTML = this.alt
        await mydb.put('image', image)
        galeria()
        editPage()
        forGale.style.opacity = 0
        forGale.style.zIndex = 0
        window['accion' +i.parentNode.parentNode.id].remove()
    }
    f.onerror=()=>{
      alert('Error')
      espere()
    }
  }

  gs =async(e)=>{
    espere()
    console.log(JSON.stringify(e,null,2))
    resultImg = e
    result = ''
    
    if(e.results){
      e.results.forEach(r=>{
        result += `<img onclick="useThisImage(this)" src="${imgLoad}" data-src="${r.tbMedUrl}" data-url="${r.url}" alt="${r.contentNoFormatting}" class="gs">`
      })
      accion(result,()=>{
        resultImg = false
        alert('Se ha eliminado la búsqueda')
      })
      loadImages()
    }

    if(e.error){
      if(e.error.code==403){
        delete api.user.cse_tok
        await mydb.put('user',api.user)
        window.location.reload()
      }
    }

  }


  if(!resultImg){
    const url = 'https://cse.google.com/cse/element/v1?rsz=filtered_cse&num=20&start=0&hl=es&source=gcsc&cselibv='+api.user.cselibv+'&searchtype=image&cx='+cx+'&q='+ inputImage.value +'&safe=off&cse_tok='+api.user.cse_tok+'&exp=cc%2Capo&callback=gs&rurl=http%3A%2F%2Flocalhost%3A8080%2Findex.html'
    script = document.createElement('script')
    script.src = url
    console.log(url)
    script.onload = function(){
      this.remove()
    }
    script.onerror = function(){
      this.remove()
      espere()
      alert('Error en la conexión!')
    }
    document.body.append(script)
  }else{
    gs(resultImg)
  }
}
