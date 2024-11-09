(async()=>{
  const showVisible = ()=>{
    for (let img of document.querySelectorAll('img[data-src]')) {
      let realSrc = img.dataset.src;
      if (!realSrc)
        continue;
      let coords = img.getBoundingClientRect();
      let windowHeight = document.documentElement.clientHeight;
      let topVisible = coords.top > 0 && coords.top < windowHeight;
      let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;
      if (topVisible || bottomVisible) {
        n = new Image();
        n.src = realSrc;
        n.onload = function() {
          document.querySelectorAll('img[data-src="' + this.src + '"]').forEach(f=>{
            f.src = this.src;
            f.dataset.src = ''
          }
          )
        }
        ;
        n.onerror = function() {
          let i = document.createElement("canvas")
            , $ = i.getContext("2d");
          let x = (i.width = 400,
          i.height = 200,
          $.fillStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--lazy') || "#0001",
          $.fillRect(0, 0, i.width, i.height),
          $.font = "900 90px arial",
          $.fillStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--color-font') || "#acacac",
          $.textAlign = "center",
          $.textBaseline = "middle",
          $.fillText('404', i.width / 2, i.height / 2),
          i.toDataURL())
          document.querySelectorAll('img[data-src="' + this.src + '"]').forEach(f=>{
            f.src = x
          }
          )
        }
        ;
      }
    }
  }

  let tabs = document.createElement('label')
  tabs.classList.add('tab-menu')
  tabs.innerHTML = `
  <input hidden type="checkbox">
  <h3>Table of content</h3>
`


  function nodeToDom(node,parent) {
    if (typeof node === 'string' || node instanceof String) {
      return document.createTextNode(node);
    }
    if (node.tag) {
      var domNode = document.createElement(node.tag);
      if (node.attrs) {
        for (var name in node.attrs) {
          var value = node.attrs[name];

          if (value && name == 'id' && (node.tag == 'h3' || node.tag == 'h4')) {
            a = document.createElement('a')
            a.setAttribute('href', '#' + value)
            a.classList.add(node.tag)
            a.innerText = value
            a.onclick = function() {
              this.parentNode.click()
            }
            tabs.append(a)
          }
          
          if (name == 'src') {
            name = 'data-src'
            !value.startsWith('http') && (value = API.apihost + value)
            domNode.setAttribute('src', imgLoad);
          }
          
          if (parent == 'section' && name == 'href' && value.startsWith( API.apihost )) {
            name = 'data-href'
            domNode.className = 'blog'
            domNode.onclick=function(){
              APIURL(this.dataset.href.replace( API.apihost, 'getPage'))
            }
          }
          
          domNode.setAttribute(name, value);
        }
      }
    } else {
      var domNode = document.createDocumentFragment();
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        if(domNode.className=='blog'&& typeof(node.children[i])=='string' ){
          m = 50
          if( node.children[i].length > m){
            node.children[i] = node.children[i].slice(0,m)+'...'
          }
        }
        var child = node.children[i];
        domNode.appendChild(nodeToDom(child,node.tag));
      }
    }
    return domNode;
  }

  try {

    inner(`
    <article>
      <div id="loader">
        <div>
        ${API.name}
        <div class="spinner"></div>
        </div>
      </div>
    </article>    
    `)

    if (!API.data) {
      /* no página para buscar */
      throw new Error(500)
    }

    let response = await fetch(['fake', 'api.json'].includes(API.data) ? API.data : ('https://api.telegra.ph/getPage/' + API.data + '?return_content=true'));
    if (response.ok) {
      let data = await response.json();
      //console.log(JSON.stringify(data, null, 2))

      if (!data.ok) {
        throw new Error(204);
      }
      const origin = ((a)=>{
        b = a.pathname.split('/');
        if (a.origin == window.location.origin && b.length == 4 && b[2] == 'user') {
          return b[3]
        } else {
          return false
        }
      }
      )(new URL(data.result.author_url || 'http://example.com'));

      if (!origin) {
        //throw new Error(2040)
      }
      
      const foot = document.createElement('footer')
      foot.innerHTML = footer
      setAPIURL(foot)
      let page = document.createElement('div')
      let pag = [
        {
          tag:'article',
          children:[
        {
          tag:'header',
          children:[
            {
              tag:'h1',
              children:[data.result.title]
            },
            {
              tag:'nav',
              children:[
                {
                  tag:'label',
                  children:['Views'],
                  attrs:{
                    'data-view':'mi-contador',
                    class:'bi-eye-fill'
                  }
                },
                {
                  tag:'a',
                  children:[data.result.path],
                  attrs:{
                    class: 'path',
                    'data-path' :data.result.url,
                    href: data.result.url
                  }
                },
              ]
            }
          ]
        },
        {
          tag:'section',
          children:data.result.content
        }
          ]
        }]
      
      page.appendChild(nodeToDom({
          children: pag
      }))
      page.append(foot)

      const article = page.querySelector('article').innerHTML.replaceAll('src="'+imgLoad+'" data-','')

        if (API.edit) {
          let getDb = await mydb.get(API.data)
          if (!getDb || article === getDb) {
            if(!getDb){
              await mydb.put(API.data, article)
              alert('Disponible para editar')
            }
          }else{
            throw new Error(423)
          }
        }
        

      const p = document.querySelector('body>section')
      p.innerHTML = ''
      p.append(page)

      if (tabs.querySelector('a')) {
        document.querySelector('body article section').prepend(tabs)
      }
        showVisible()
        window.addEventListener('scroll', showVisible);
        (document.querySelector('body section')).addEventListener('scroll', showVisible);
        
    } else {
      throw new Error(response.status)
    }
  } catch (e) {
    eCatch(e.message)
  }
}
)()
