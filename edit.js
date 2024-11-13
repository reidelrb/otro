function domToNode(domNode) {
  if (domNode.nodeType == domNode.TEXT_NODE) {
    return domNode.data;
  }
  if (domNode.nodeType != domNode.ELEMENT_NODE) {
    return false;
  }
  var nodeElement = {};
  nodeElement.tag = domNode.tagName.toLowerCase();
  for (var i = 0; i < domNode.attributes.length; i++) {
    var attr = domNode.attributes[i];
    if (attr.name == 'data-href' || attr.name == 'href' || attr.name == 'src') {
      if (!nodeElement.attrs) {
        nodeElement.attrs = {};
      }
      if(attr.name == 'data-href'&& attr.value.startsWith('get/')){
        attr.value = attr.value.replace('get','https://telegra.ph')
      }
      nodeElement.attrs[attr.name.replace('data-', '')] = attr.value;
    }
  }
  if (domNode.childNodes.length > 0) {
    nodeElement.children = [];
    for (var i = 0; i < domNode.childNodes.length; i++) {
      var child = domNode.childNodes[i];
      nodeElement.children.push(domToNode(child));
    }
  }
  return nodeElement;
}
;(async()=>{
  try {

    if (!api.user) {
      /* no tiene cuenta */
      throw new Error(401)
    }

    const template = await mydb.get(api.content)

    if (!api.content || !template) {
      /* no hay página seleccionada */
      throw new Error(404)
    }

    if (!api.edit) {
      /* la página no es editable */
      throw new Error(403)
    }

    inner(`
      <div id="forGale">
        <div id="galeSelect">
          <div class="loadImage">
            <input id="inputImage" placeholder="Buscador URL" type="url">
            <label id="loadImage" class="bi-image"></label>
          </div>
          <section></section>
        </div>
      </div>
    ${template.replaceAll('"' + imgtext + '200"', '"img-default.png"')}
    <a footer></a>
    <div class="add">
      <nav>
      <a data-add="a" class="bi-link-45deg"></a>
      <a data-add="h3" class="bi-type-h3"></a>
      <a data-add="h4" class="bi-type-h4"></a>
      <a data-add="strong" class="bi-type-bold"></a>
      <a data-add="p" class="bi-justify-left"></a>
      <a data-add="figure" class="bi-image"></a>
      <a data-add="pre" class="bi-code"></a>
      <a data-add="blockquote" class="bi-quote"></a>
      </nav>
      <div>
        <a id="btnDescarta" class="bi-x-circle-fill"></a>
        <a id="btnSave" class="bi-check-circle-fill done-s"> Done</a>
        <a id="downHtml" class="bi-app"> Down</a>
        <div></div>
        <a data-href="account">Home</a>
      </div>
    </div>
    `);

    here = galeSelect.querySelector('section')
    loadImage.onclick = ()=>{
      i = inputImage.value
      inputImage.value = ''

      if (i.startsWith('http')) {
        waitX = document.createElement('div')
        waitX.innerHTML = '_wait '
        waitX.className = 'waitX'
        document.body.append(waitX)
        let x = new Image()
        x.src = i
        x.onload = async function() {
          image[this.src] = 1
          a_select.querySelector('img').src = this.src
          await mydb.put('image', image)
          editPage()
          galeria()
        }
        x.onerror = ()=>{
          alert('Error')
          waitX.remove()
        }
      } else {
        try {
          searchImage(i)
        } catch (err) {
          alert('La URL es incorrecta!')
        }
      }
    }
    ;

    (galeria = ()=>{
      here.innerHTML = ''
      for (b in image) {
        v = new Image()
        v.onclick = function() {
          forGale.style.opacity = 0
          forGale.style.zIndex = 0
          console.log(this.dataset.usa)
          a_select.querySelector('img').src = this.dataset.usa || this.src
          editPage()
        }
        v.className = "gale"
        v.dataset.src = b
        v.dataset.usa = b
        v.src = imgLoad
        v.loading = "lazy"
        here.prepend(v)
      }
      loadImages()
    }
    )();

    btnDescarta.onclick = ()=>{
      accion('Descartar los cambios', async()=>{
        await mydb.delete(api.content)
        APIURL(api.host + 'get/' + api.content,'get/' + api.content)
      }
      )
    }

    const draggables = document.querySelectorAll('[data-add]');
    const dropArea = document.querySelector('article');

    draggables.forEach(draggable=>{
      const moveAt = (pageX,pageY,offsetX,offsetY)=>{
        draggable.style.position = 'fixed';
        draggable.style.left = pageX - offsetX + 'px';
        draggable.style.top = pageY - offsetY + 'px';
      }

      const suelta = (f)=>{
        const addT = (t)=>{
          let e = document.createElement(t);
          (t == 'h3' || t == 'h4' || t == 'strong') && (e.innerHTML = 'Lorem ipsum');
          t == 'blockquote' && (e.innerHTML = '<i>Lorem ipsum</i>');
          t == 'figure' && (e.innerHTML = '<img src="img-default.png"><figcaption>click to change</figcaption>');
          t == 'pre' && (e.innerHTML = 'function name(){\n  //code here\n}');
          t == 'p' && (e.innerHTML = 'Eligendi usu ea, ei Tritani ceteros omnis menandri iriure antiopam. disputandor oportere has. bh vide wisi, pro in.');
          t == 'a' && (e.className = 'blog',
          e.dataset.href = 'offline',
          e.innerHTML = '<img src="img-default.png">Link to other page of telegraph');
          return e
        }
        const fin = (f)=>{
          if (f) {
            f.style.position = 'relative';
            f.style.left = 0
            f.style.top = 0
            return false
          }
        }
        let article = document.querySelector('article')
        let l = article.childNodes
        l.forEach(o=>{
          if (f && f.getBoundingClientRect().bottom < document.querySelector('div.add nav').getBoundingClientRect().top && f.getBoundingClientRect().top > o.getBoundingClientRect().top && f.getBoundingClientRect().top + 20 < o.getBoundingClientRect().bottom) {
            o.after(addT(f.dataset.add))
            editPage()
            f = fin(f)
          }
        }
        )
        if (l.length == 0) {
          document.querySelector("article").append(addT(f.dataset.add))
          editPage()
          f = fin(f)
        }
        fin(f)
      }

      const onMouseMove = (e)=>{
        moveAt(e.pageX, e.pageY, offsetX, offsetY);
      }

      const onTouchMove = (e)=>{
        touch = e.touches[0];
        moveAt(touch.pageX, touch.pageY, offsetX, offsetY);
      }

      if (api.platform == 'Windows' || api.platform == 'Unknown') {
        draggable.onmousedown = function(e) {
          offsetX = e.clientX - draggable.getBoundingClientRect().left;
          offsetY = e.clientY - draggable.getBoundingClientRect().top;

          document.onmousemove = onMouseMove

          draggable.onmouseup = function() {
            document.onmousemove = function() {}
            suelta(draggable)
          }
        }
      } else {
        draggable.ontouchstart = function(e) {
          const touch = e.touches[0];
          offsetX = touch.clientX - draggable.getBoundingClientRect().left;
          offsetY = touch.clientY - draggable.getBoundingClientRect().top;

          document.ontouchmove = onTouchMove;

          draggable.ontouchend = function() {
            document.ontouchmove = ()=>{}
            suelta(draggable)
          }
        }
      }
    }
    );

    dropArea.addEventListener('dragover', (e)=>{
      e.preventDefault();
      // Necesario para permitir el drop
    }
    )

    dropArea.addEventListener('drop', (e)=>{
      e.preventDefault();
      // Evita el comportamiento por defecto
    }
    )

    clip = false;

    (editPage = async()=>{
      /*EDITOR CLICK*/
      ['figure', 'a', 'blockquote', 'i', 'pre', 'h1', 'h4', 'h3', 'p', 'article>strong', 'figcaption'].forEach(o=>{
        document.querySelectorAll(o).forEach(e=>{
          let t = e.tagName
          e.classList.remove('selecto')
          if (e.parentNode.tagName == 'ARTICLE' || ['H1', 'FIGCAPTION', 'I'].includes(t)) {

            e.oncontextmenu = function() {
              event.stopPropagation()
              if (this.parentNode.tagName == 'ARTICLE' && this.contentEditable != 'plaintext-only') {
                event.preventDefault()
                selection = this
                this.classList.add('selecto')
                let o = document.createElement('dialog')
                o.className = 'menu-e'
                o.onclick = function() {
                  selection.classList.remove('selecto')
                  this.remove()
                }
                o.innerHTML = `
              <label onclick="clip=selection.cloneNode(true);selection.remove()" class="bi-copy"> Mover</label>
              <label onclick="accion('Eliminar el elemento selecionado',()=>{selection.remove();editPage()})" class="bi-trash"> Borrar</label>
            `;
                document.body.append(o)
                o.showModal()
                this.focus()
              }
            }

            e.onclick = function() {
              event.preventDefault()
              event.stopPropagation()
              if (clip) {
                if (this.parentNode.tagName == 'ARTICLE') {
                  this.after(clip)
                  clip = false
                  editPage()
                }
              } else {
                if (t == 'FIGURE') {
                  a_select = this
                  forGale.style.opacity = 1
                  forGale.style.zIndex = 20
                }

                if (t == 'A' && this.className == 'blog') {
                  let v = '';
                  a_select = this
                  for (b in offline) {
                    i = (offline[b].img == imgtext + '200' ? 'img-default.png' : offline[b].img) || placeholder('20')
                    v += `<a id="${b}" class="blog" onclick="a_select.dataset.href='get/${b}'; a_select.innerHTML = this.innerHTML ; window['accion' +this.parentNode.parentNode.id].remove();editPage()"><img src="${i}">${offline[b].title}</a>`
                  }
                  alert(v)
                  try {
                    document.querySelector('dialog div').scrollTop = document.querySelector('#' + (this.href.replace(window.location.origin + '/', ''))).getBoundingClientRect().top
                  } catch (er) {}
                }

                if (['H1', 'H3', 'H4', 'P', 'I', 'STRONG', 'FIGCAPTION'].includes(t)) {
                  this.contentEditable = 'plaintext-only',
                  this.scrollIntoView({
                    behavior: 'smooth'
                  }),
                  this.focus(),
                  this.onblur = function() {
                    (this.tagName == 'P' || this.tagName == 'I') && (this.innerHTML = this.innerHTML.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>').replace(/~(.*?)~/gim, '<code>$1</code>').replace(/(\n)/gim, '<br>'));
                    this.contentEditable = 'inherit'
                    event.preventDefault()
                    event.stopPropagation()
                    editPage()
                  }
                }
              }
            }
          }
        }
        )
      }
      )
      /*END EDITOR CLICK*/
      try {
        let chan = document.querySelector('header').outerHTML + document.querySelector('article').outerHTML;
        await mydb.put(api.content, chan)
      } catch (er) {}
    }
    )()

    btnSave.onclick = ()=>{
      accion('Publicar los cambios', async()=>{
        let content = JSON.parse(JSON.stringify(domToNode(document.querySelector('article')).children).replaceAll('"img-default.png"', '"' + imgtext + '200"'))
        console.log(JSON.stringify(content, null, 2))
        if (content.length > 0) {
          const params = new URLSearchParams({
            access_token: api.user.token,
            title: document.querySelector('h1').innerText,
            author_name: api.user.author_name,
            author_url:  'https://rok.com',
            return_content: false,
            path: api.content,
            content: JSON.stringify(content),
          });
          try {
            wait()
            const url = 'https://api.telegra.ph/editPage'
            const response = await fetch(url, {
              method: 'POST',
              body: params
            });
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2))
            if (data.ok) {
              await mydb.delete(api.content)

              APIURL(  api.host+ 'get/' + api.content,'get/' + api.content)
            } else {
              eCatch(data.error || 'Error inesperado')
            }
          } catch (error) {
            eCatch(error);
          }
        } else {
          alert('¡No hay contenido para publicar!')
        }
      }
      )
    }

    downHtml.onclick = async()=>{
      try {
        let response = await fetch('page.css');
        let data = await response.text()
        if (response.ok) {

          basic_css = data
          mibody = await mydb.get(api.content)
          html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1,minimum-scale=1,maximum-scale=1"/><title>${document.querySelector("h1").innerHTML}</title><style>${basic_css}</style></head><body><main>${mibody}</main></body></html>`;

          let e = html.split(/(?=<)/).map(e=>e.trim())
            , t = ""
            , n = 0;
          e.forEach(e=>{
            e.startsWith("</") && --n < 0 && (n = 0),
            ["</title>", "<br>", "</i>", "</style>", "</script>", "</span>", "</b>", "</p>", "</h1>", "</h3>", "</h4>", "</figcaption>"].indexOf(e) >= 0 ? t += e : t += "\n" + "  ".repeat(n) + e,
            !e.startsWith("<") || e.endsWith("/>") || e.startsWith("</") || e.startsWith("<input") || e.startsWith("<img") || e.startsWith("<!DOCTYPE") || e.startsWith("<br") || e.startsWith("<hr") || n++
          }
          );
          let l = document.createElement("a")
            , o = new Blob([t.trim()],{
            type: "text/html"
          });
          //l.download = document.querySelector("h1").innerHTML + '.html'
          l.href = URL.createObjectURL(o),
          l.click(),
          URL.revokeObjectURL(l.href)
        } else {
          alert('No se ha podido generar la descarga!')
        }
      } catch (e) {
        alert('Error grave')
      }

    }

  } catch (err) {
    eCatch(err.message)
  }
}
)()
