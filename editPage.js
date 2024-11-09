(async()=>{
  try {

    if (!API.user) {
      /* no tiene cuenta */
      throw new Error(401)
    }

    if (!API.edit) {
      /* la página no es editable */
      throw new Error(403)
    }

    const template = await mydb.get(API.data)

    if (!API.data || !template) {
      /* no hay página seleccionada */
      throw new Error(404)
    }

    inner(`
    <article>${template}</article>
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
        <a data-href="home">Back</a>
        <a id="btnDescarta" class="bi-trash">Trash</a>
        <a id="btnSave" class="bi-check-circle-fill done-s">Done</a>
      </div>
    </div>
  `);
    clip = false;
    article = document.querySelector('article');

    btnDescarta.onclick = async()=>{
      accion('¿Seguro desea eliminar éste borrador? Se perderán los cambios si no se publica!',async()=>{
        await mydb.delete(API.data)
        APIURL('getPage/'+API.data)
      })
    }
    btnSave.onclick = async()=>{
      let content = domToNode(document.querySelector('article section')).children
      if(content.length>0){
        accion('¿Publicar los cambios en telegra.ph?',async()=>{
          const params = new URLSearchParams({
            access_token: API.user.token,
            title: document.querySelector('h1').innerText,
            author_name: API.user.name,
            author_url: (API.origin!='localhost'?window.location.origin:'https://t.me/') +'user/' + API.user.user,
            return_content: false,
            path: API.data,
            content: JSON.stringify(content),
          });
          inner(
            ``
          )
          try {
            const url = 'https://api.telegra.ph/editPage'
            const response = await fetch( url , {
              method: 'POST',
              body: params
            });
            const data = await response.json();
            console.log(JSON.stringify(data, null, 2))
            if(data.ok){
              miurl = window.location.origin+ '/'+ API.service +'/' + getAPIURL('getPage/'+data.result.path) 
              accion(`La URL de acceso a tu página: <input disabled value="${miurl}" type="url"> `, ()=>{
                copyToClip(miurl)
              })              
            }else{
              eCatch(data.error||'Error inesperado')
            }
          } catch (error) {
            eCatch(error);
          }
        })
      }else{
        alert('¡No hay contenido para publicar!')
      }
      //console.log( JSON.stringify(content,null,2) )
    }

    /*ADD ELEM*/
    document.querySelectorAll('[data-add]').forEach(b=>{
      b.onclick = function() {
        let t = this.dataset.add
        let e = document.createElement(t)
        t == 'blockquote' && (e.innerHTML = '<i>Lorem ipsum</i>');
        t == 'figure' && (e.innerHTML = '<img src="' + imgLoad + '"><figcaption>click to change</figcaption>');
        t == 'pre' && (e.innerHTML = 'function name(){\n  //code here\n}');
        (t == 'h3' || t == 'h4' || t == 'strong') && (e.innerHTML = 'Lorem ipsum');
        t == 'p' && (e.innerHTML = 'Eligendi usu ea, ei Tritani ceteros omnis menandri iriure antiopam. disputandor oportere has. bh vide wisi, pro in.');
        document.querySelector('article section').append(e)
        document.querySelector('[footer]').scrollIntoView({
          block: 'center',
          behavior: 'smooth'
        })
        editPage()
      }
    }
    );
    /*END ADD*/

    (editPage = async()=>{
      /*EDITOR CLICK*/
      try {
        await mydb.put(API.data, article.innerHTML);
      } catch (e) {
        console.log(e.message)
      }
      ;['figure', 'a', 'blockquote', 'i', 'pre', 'h1', 'h4', 'h3', 'p', 'section>strong', 'figcaption'].forEach(o=>{
        article.querySelectorAll(o).forEach(e=>{
          e.classList.remove('selecto')
          e.oncontextmenu = function() {
            event.stopPropagation()
            if ( this.parentNode.tagName== 'SECTION' && this.contentEditable != 'plaintext-only') {
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
            if (!clip) {
              event.stopPropagation()
              event.preventDefault()
              let t = this.tagName;
              (t == 'H4' || t == 'I' || t == 'PRE' || t == 'P' || t == 'H3' || t == 'H1' || t == 'STRONG' || t == 'FIGCAPTION') && (this.contentEditable = 'plaintext-only',
              this.scrollIntoView({
                block: 'center',
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
              )
              t == 'FIGURE' && (fN = this,
              load(true),
              setTimeout('gl.style.display="flex",load()', 200))
            } else {
              if (this.parentNode.tagName== 'SECTION') {
                this.after(clip)
                clip = false
                editPage()
              }
            }
          }
        }
        )
      }
      )

      /*END EDITOR CLICK*/
    }
    )()

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
      nodeElement.attrs[attr.name.replace('data-','')] = attr.value;
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

  } catch (e) {
    eCatch(e.message)
  }
}
)()
