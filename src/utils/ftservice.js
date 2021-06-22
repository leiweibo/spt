import ftWebsocket from "futu-api";

const websocket = new ftWebsocket();

const dorequest = (store, dologinsuc, dologinfail)=> {
  websocket.start(
    store.state.addr,
    store.state.port,
    store.state.enable_ssl,
    store.state.key
  );

  websocket.onlogin = (ret, msg) => {
    if (ret) {
      dologinsuc(msg)
    } else {
      dologinfail("error: 请检查是否有设置store.js中key字段")
      console.log("error:", msg);
    }
  }
  
  return websocket
};

export {dorequest};
