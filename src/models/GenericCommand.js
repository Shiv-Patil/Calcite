module.exports = class GenericCommand {
  constructor (execute, props) {
    this.execute = execute;
    this.cmdProps = props;
  }

  async run ({ interaction, options, client, user }) {
    return this.execute({ interaction, options, client, user });
  }

  get props () {
    return Object.assign({
      usage: '{command}',
      cooldown: 2000,
    }, this.cmdProps, {
      perms: ['SEND_MESSAGES'].concat(this.cmdProps.perms || [])
    });
  }
};
