module.exports = class ModeratorCommand {
  constructor (execute, props) {
    this.execute = execute;
    this.cmdProps = props;
  }

  async run ({ cmd, args, client, user }) {
    if (this.props.missingArgs && !args[0]) {
      return this.props.missingArgs;
    }
    if (this.props.minArgs && args.length < this.props.minArgs) {
      return this.props.missingArgs;
    }
    return this.execute({ cmd, args, client, user });
  }

  get props () {
    return Object.assign({
      usage: '{command}',
      cooldown: 2000,
      donorCD: 500,
      isNSFW: false,
      ownerOnly: false,
      donorOnly: false,
      requiresPremium: false
    }, this.cmdProps, {
      perms: ['sendMessages'].concat(this.cmdProps.perms || [])
    });
  }
};