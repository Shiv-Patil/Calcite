const { join } = require("path");
let expo = {};
var sql;

expo.init = async (_sql) => {
  sql = _sql;
  expo.sql = _sql;
  await sql.file(join(__dirname, 'tables.sql'))
}

expo.add_guild = async (server_id) => {
  // Creates rows for a specific guild.
  let r = Array.from(await sql`SELECT server_id FROM config WHERE server_id=${server_id};`);
  if (!r.length) {
    await sql`INSERT INTO config (server_id) VALUES (${server_id});`;
    await sql`INSERT INTO channels (server_id) VALUES (${server_id});`;
    await sql`INSERT INTO welcome (server_id) VALUES (${server_id});`;
    await sql`INSERT INTO leave (server_id) VALUES (${server_id});`;
    await sql`INSERT INTO logs (server_id) VALUES (${server_id});`;
  }
}

expo.remove_guild = async (server_id) => {
  // Remove all rows corresponding to guild
  await sql`DELETE FROM config WHERE server_id=${server_id};`;
  await sql`DELETE FROM channels WHERE server_id=${server_id};`;
  await sql`DELETE FROM welcome WHERE server_id=${server_id};`;
  await sql`DELETE FROM leave WHERE server_id=${server_id};`;
  await sql`DELETE FROM level WHERE server_id=${server_id};`;
  await sql`DELETE FROM level_rewards WHERE server_id=${server_id};`;
  await sql`DELETE FROM logs WHERE server_id=${server_id};`;
  await sql`DELETE FROM mutes WHERE server_id=${server_id};`;
  await sql`DELETE FROM roles WHERE server_id=${server_id};`;
}

expo.set_user_calcite = async (member_id, calcite) => {
  await sql`
    INSERT INTO currency (member_id, calcite)
    VALUES (${member_id}, ${calcite})
    ON CONFLICT (member_id)
    DO UPDATE SET calcite=${calcite};
  `;
}

expo.get_user_calcite = async (member_id) => {
  r = await sql`SELECT calcite FROM currency WHERE member_id=${member_id};`
  if (!r.length) {
    calcite = BigInt(100);
    await expo.set_user_calcite(member_id, calcite);
  }
  else calcite = r[0].calcite;
  return calcite;
}

expo.fetch_prefix = async (server_id) => {
  //Fetches a guild's prefix.
  r = Array.from(await sql`SELECT prefix FROM config WHERE server_id=${server_id};`)[0];
  if (!r) return "c";
  return r["prefix"];
}

module.exports = expo;
