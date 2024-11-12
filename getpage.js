function nodeToDom(node, parent) {
  if (typeof node === 'string' || node instanceof String) {
    return document.createTextNode(node);
  }
  if (node.tag) {
    var domNode = document.createElement(node.tag);
    if (node.attrs) {
      for (var name in node.attrs) {
        var value = node.attrs[name];

        if (name == 'src') {
          name = 'data-src'
          !value.startsWith('http') && (value = 'https://telegra.ph' + value)
          domNode.setAttribute('src', imgLoad);
        }

        if (name == 'href' && value.startsWith('/')) {
          domNode.className = 'blog'
        }

        domNode.setAttribute(name, value);
      }
    }
  } else {
    var domNode = document.createElement('div');
  }
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      if (domNode.className == 'blog' && typeof (node.children[i]) == 'string') {
        m = 50
        if (node.children[i].length > m) {
          node.children[i] = node.children[i].slice(0, m) + '...'
        }
      }
      var child = node.children[i];
      domNode.appendChild(nodeToDom(child, node.tag));
    }
  }
  return domNode;
}

(async()=>{
  const credito = `<div class="moreinfo"> Página de <a href="//telegra.ph">Telegraph</a> generada en <a data-href="terminos">[miHerramienta] </a> </div> `
  try {

    if (!API.request) {
      /* no página para buscar */
      throw new Error(500)
    }

    wait()
    let response = await fetch(['fake', 'api'].includes(API.request) ? API.request : ('https://api.telegra.ph/getPage/' + API.request + '?return_content=true'));

    if (response.ok) {
      let data = await response.json()
      console.log(JSON.stringify(data))
      if (!data.ok) {
        if (data.error == "PAGE_NOT_FOUND") {
          throw new Error(404)
        } else {
          throw new Error(204)
        }
      }

      delete offline[API.request];
      offline[API.request] = {
        title: data.result.title.slice(0, 30),
        img: data.result.image_url
      }
      await mydb.put('offline', offline)

      //console.log(JSON.stringify(data, null, 3))

      let template = `<header><h1>${data.result.title}</h1><nav><a href="javascript:copyTo( window.location.href  )" class="bi-link-45deg"> ${data.result.path}</a><p>${data.result.author_name || 'Vista desde [miHerramienta]'}</p></nav></header><article>${nodeToDom({
        children: data.result.content
      }).innerHTML}</article>`
      let templateSave = template.replaceAll('src="' + imgLoad + '" data-', '')
      let getTemp = await mydb.get(API.request)

      if (API.edit) {
        if (templateSave == getTemp || !getTemp) {
          await mydb.put(API.request, templateSave)
          console.log('iguales')
        } else {
          throw new Error(423)
        }
      } else {
        await mydb.put(API.request, templateSave)
      }

      inner(template + credito + footer)

      imgs = document.querySelectorAll('img')
      imgs.forEach(async(f,n)=>{
        if (f.dataset.src && (f.dataset.src).startsWith('http') && !(f.dataset.src).startsWith(imgtext)) {
          image[f.dataset.src] = 1
        }
      }
      )
      await mydb.put('image', image)

    }
  } catch (err) {
    let offline = await mydb.get(API.request)
    if (offline && err.message == 'Failed to fetch') {
      inner(`
          ${offline + credito}
          <footer>
            <a data-href="account"><div class="moreinfo">View offLine</div></a>
            <a data-href="back" class="bi-arrow-left-square-fill"> Back</a>
            ${API.edit ? `<a data-href="editPage/${API.request}" class="">Editar</a>` : ''}
          </footer>
          `);
      console.log(offline)

      document.querySelectorAll('img').forEach(async(f,n)=>{
        if (n == 0 && offline[API.request]) {
          offline[API.request].img = f.src
          await mydb.put('offline', offline)
        }
        f.onerror = function() {
          this.src = placeholder('Error')
        }
      }
      )
    } else {
      eCatch(err.message)
    }
  }
}
)()
