let expo = {};
const sql = require('postgres')(process.env.DATABASE_URL, {idle_timeout: 2});
expo.sql = sql;

expo.init = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS config(
      server_id BIGINT,
      prefix TEXT DEFAULT 'c',
      welcome BOOL DEFAULT false,
      autorole BOOL DEFAULT false,
      leave BOOL DEFAULT false,
      level BOOL DEFAULT false,
      level_rewards BOOL DEFAULT false,
      stack_rewards BOOL DEFAULT false,
      cleverbot BOOL DEFAULT false,
      logs BOOL DEFAULT false,
      captcha BOOL DEFAULT false
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS channels(
      server_id BIGINT,
      welcome BIGINT,
      leave BIGINT,
      log BIGINT,
      level BIGINT,
      captcha BIGINT,
      cleverbot BIGINT
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS roles(
      server_id BIGINT,
      role_id BIGINT,
      type TEXT
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS welcome(
      server_id BIGINT,
      message TEXT,
      embed BOOL DEFAULT true,
      embed_colour TEXT
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS leave(
      server_id BIGINT,
      message TEXT,
      embed BOOL DEFAULT true,
      embed_colour TEXT
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS level(
      server_id BIGINT,
      member_id BIGINT,
      level BIGINT,
      xp BIGINT
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS level_rewards(
      server_id BIGINT,
      role_id BIGINT,
      level BIGINT
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS logs(
      server_id BIGINT,
      msg_delete BOOL DEFAULT true,
      msg_bulk_delete BOOL DEFAULT true,
      msg_edit BOOL DEFAULT true,
      ch_create BOOL DEFAULT true,
      ch_delete BOOL DEFAULT true,
      member_ban BOOL DEFAULT true,
      member_unban BOOL DEFAULT true,
      voicestate_update BOOL DEFAULT false,
      guild_update BOOL DEFAULT true,
      role_create BOOL DEFAULT true,
      role_update BOOL DEFAULT true,
      role_delete BOOL DEFAULT true,
      emoji_update BOOL DEFAULT false,
      invite_create BOOL DEFAULT false,
      invite_delete BOOL DEFAULT false
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS mutes(
      server_id BIGINT,
      member_id BIGINT,
      end_time TIMESTAMP
    );`
  await sql`
    CREATE TABLE IF NOT EXISTS warns(
      server_id BIGINT,
      member_id BIGINT,
      warn_id TEXT,
      reason TEXT
    );
  `;
}

expo.add_guild = async (server_id) => {
  // Creates rows for a specific guild.
  let r = Array.from(await sql`SELECT server_id FROM config WHERE server_id=${server_id};`);
  console.log(r);
  if (!r.length) {
    console.log('insert');
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

expo.fetch_prefix = async (server_id) => {
  //Fetches a guild's prefix.
  r = Array.from(await sql`SELECT prefix FROM config WHERE server_id=${server_id};`)[0];
  if (!r) return "c";
  return r["prefix"];
}

module.exports = expo;
