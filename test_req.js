const fs = require('fs');
async function test() {
  const tokenUrl = 'https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token';
  const rxUrl = 'https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1/recepcion';
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: 'api-stag',
    username: 'cpj-3-102-909464@stag.comprobanteselectronicos.go.cr',
    password: 'CqBI8Q9bQJsUuj2-hb!K'
  });
  let res = await fetch(tokenUrl, {method:'POST', body, headers:{'Content-Type':'application/x-www-form-urlencoded'}});
  let data = await res.json();
  const token = data.access_token;
  
  const payload = {
    clave: "50613042600310289846400100001040000000083132015753",
    fecha: "2026-04-13T22:24:19-06:00",
    emisor: { tipoIdentificacion: "02", numeroIdentificacion: "003102898464" },
    comprobanteXml: "PD94bWw="
  };
  
  let rx = await fetch(rxUrl, {
    method: 'POST',
    headers: { 'Authorization': 'bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(rx.status);
  console.log(await rx.text());
  for(let [k,v] of rx.headers) console.log(k, v);
}
test();
