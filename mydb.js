class SimpleIndexedDB {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  async init() {
    return new Promise((resolve,reject)=>{
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event)=>{
        const db = event.target.result;
        db.createObjectStore(this.storeName, {
          keyPath: 'id'
        });
      }
      ;

      request.onsuccess = (event)=>{
        this.db = event.target.result;
        resolve();
      }
      ;

      request.onerror = (event)=>{
        reject(event.target.error);
      }
      ;
    }
    );
  }

  async add(item) {
    return new Promise((resolve,reject)=>{
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(item);

      request.onsuccess = ()=>resolve();
      request.onerror = (event)=>reject(event.target.error);
    }
    );
  }

  async update(item) {
    return new Promise((resolve,reject)=>{
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);

      request.onsuccess = ()=>resolve();
      request.onerror = (event)=>reject(event.target.error);
    }
    );
  }

  async get(id) {
    return new Promise((resolve,reject)=>{
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = ()=>resolve(request.result);
      request.onerror = (event)=>reject(event.target.error);
    }
    );
  }

  async delete(id) {
    return new Promise((resolve,reject)=>{
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = ()=>resolve(true);
      request.onerror = (event)=>reject(event.target.error);
    }
    );
  }
}

const mydb = {
  init: async function() {
    db = new SimpleIndexedDB('myDatabase','myStore');
    await db.init();
    return db
  },
  put: async function(e, d) {
    await (await this.init()).update({
      id: e,
      data: d
    });
    return d
  },
  get: async function(e) {
    return ((await (await this.init()).get(e)) || {
      data: null
    }).data
  },
  delete: async function(e) {
    return await (await this.init()).delete(e)
  }
}
