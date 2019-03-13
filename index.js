require('dotenv').config()
const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const send = require('./send')

const opts = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
}

const connect = async (query) => {
  return await new Promise(resolve => {
    const connection = mysql.createConnection(opts)
    connection.connect()
    connection.query(query, (err, results, fields) => {
      err ? console.log(`error: ${err.stack}`) : null;
      connection.end()
      resolve(results)
    })
  })
}


const program = async () => {
  const connection = mysql.createConnection(opts);

  const instance = new MySQLEvents(connection, {
    startAtEnd: true,
    excludedSchemas: {
      mysql: true,
    },
  });

  await instance.start();

  instance.addTrigger({
    name: 'NEW_VISITS',
    expression: 'simpus.visits',
    statement: MySQLEvents.STATEMENTS.INSERT,
    onEvent: async (event) => { // You will receive the events here
      if(event.affectedRows.length) {
        for (let { after } of event.affectedRows) {
          let res = await connect(`SELECT * FROM patients WHERE id = "${after.patient_id}"`)
          for (let re of res){
            let all = Object.assign({}, after, {
              visit_id: after.id
            }, re)

            if(all.no_hp.match(/^(08)([0-9]){1,12}$/)) {
              for(let prop in all){
                if(all[prop] === '' || !all[prop]){
                  delete all[prop]
                }
              }
              //send wa here
              all.no_hp = `62${all.no_hp.substr(1)}`
              //await send(noHp)
              console.log(JSON.stringify(all, null, 2));
              console.log('Terima kasih atas kepercayaan Anda terhadap Puskesmas Sibela.\n Jika ada kritik dan saran terhadap pelayanan kami, mohon dapat mengisi form berikut:\n https://goo.gl/forms/T6WsWFt8bGkmNPtM2\n')

            } else {
              console.log('tdk ada no hp')
            }
          }
        }
      }
    },
  });

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
  .then(() => console.log('Waiting for database events...'))
  .catch(console.error);