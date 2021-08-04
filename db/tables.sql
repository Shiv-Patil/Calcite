CREATE TABLE IF NOT EXISTS config(
    server_id BIGINT,
    prefix TEXT DEFAULT 'c',
    welcome BOOL DEFAULT false,
    leave BOOL DEFAULT false,
    count_autoroles INT DEFAULT 0,
    count_reactionroles INT DEFAULT 0,
    level BOOL DEFAULT true,
    level_rewards BOOL DEFAULT false,
    stack_rewards BOOL DEFAULT false,
    logs BOOL DEFAULT false,
    currency BOOL DEFAULT true
);

CREATE TABLE IF NOT EXISTS channels(
    server_id BIGINT,
    welcome BIGINT,
    leave BIGINT,
    log BIGINT,
    level BIGINT
);

CREATE TABLE IF NOT EXISTS autoroles(
    server_id BIGINT,
    role_id BIGINT
);

CREATE TABLE IF NOT EXISTS reactionroles(
    server_id BIGINT,
    reaction_id BIGINT,
    message_id BIGINT,
    role_id BIGINT
);

CREATE TABLE IF NOT EXISTS welcome(
    server_id BIGINT,
    message TEXT,
    embed BOOL DEFAULT true,
    embed_colour TEXT
);

CREATE TABLE IF NOT EXISTS leave(
    server_id BIGINT,
    message TEXT,
    embed BOOL DEFAULT false,
    embed_colour TEXT
);

CREATE TABLE IF NOT EXISTS level(
    server_id BIGINT,
    member_id BIGINT,
    member_level BIGINT,
    xp BIGINT,
    lastmsg BIGINT  -- linux epoch timestamp
);

CREATE TABLE IF NOT EXISTS level_rewards(
    server_id BIGINT,
    role_id BIGINT,
    level BIGINT
);

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
);

CREATE TABLE IF NOT EXISTS mutes(
    server_id BIGINT,
    member_id BIGINT,
    end_time BIGINT -- linux epoch timestamp
);

CREATE TABLE IF NOT EXISTS warns(
    server_id BIGINT,
    member_id BIGINT,
    warn_id TEXT,
    reason TEXT
);
