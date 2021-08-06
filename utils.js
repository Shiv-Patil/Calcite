module.exports = {
  async parseMention (user, arg, client) {
    let mentionID = arg.trim().match(/^<@!?(\d+)>$/);
    if (!mentionID) mentionID = arg.trim();
    else {mentionID = mentionID[1]};
    try {
      return await client.users.fetch(mentionID);;
    } catch (error) {
      return user;
    }
  }
}
