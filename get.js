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
          name = 'data-href'
          value = 'get' + value
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
        m = 40
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
  const credito = `<div class="moreinfo"> Página de <a href="//telegra.ph/${api.content}">Telegraph</a> vista en <a data-href="terminos">[miHerramienta] </a> </div> `
  try {

    if (!api.content) {
      /* no página para buscar */
      throw new Error(500)
    }

    let response = await fetch(['fake', 'api'].includes(api.content) ? api.host+api.content : ('https://api.telegra.ph/getPage/' + api.content + '?return_content=true'));

    if (response.ok) {
      data = await response.json()
      console.log(JSON.stringify(data))
      if (!data.ok) {
        if (data.error == "PAGE_NOT_FOUND") {
          throw new Error(404)
        } else {
          throw new Error(204)
        }
      }
    } else {
      throw new Error(404)
    }

    let template = `<header><h1>${data.result.title}</h1><nav><a href="javascript:copyTo( window.location.href  )" class="bi-link-45deg"> ${data.result.path}</a><p>${data.result.author_name || 'Vista desde [miHerramienta]'}</p></nav></header><article>${nodeToDom({
      children: data.result.content
    }).innerHTML}</article>`

    let templateSave = (template.replaceAll('src="' + imgLoad + '" data-', '')).replaceAll(imgtext + 'Ok', api.host+'img-default.png')
    let getTemp = await mydb.get(api.content)

    if (api.edit) {
      if (templateSave == getTemp || !getTemp) {
        await mydb.put(api.content, templateSave)
        console.log('iguales')
      } else {
        throw new Error(423)
      }
    } else {
      await mydb.put(api.content, templateSave)
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

    delete offline[api.content];
    offline[api.content] = {
      title: data.result.title.slice(0, 45),
      img: data.result.image_url
    }
    await mydb.put('offline', offline)

  } catch (e) {
    let record = await mydb.get(api.content)
    if (e.message == 'Failed to fetch' && record) {
      inner(record + credito + `
          <footer>
            <a data-href="offline"><div class="moreinfo">View offLine</div></a>
            <a data-href="back" class="bi-arrow-left-square-fill"> Back</a>
            ${api.edit ? `<a data-href="edit/${api.content}" class="">Editar</a>` : ''}
          </footer>
        `)
      console.log('{offline:true}')
    } else {
      eCatch(e.message)
    }
  }
}
)()
