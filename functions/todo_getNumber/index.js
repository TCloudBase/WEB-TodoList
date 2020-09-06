const tcb = require('@cloudbase/node-sdk')

const cloud = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const db = cloud.database()

exports.main = async () => {
  return (await db.collection('todo').count()).total
}
