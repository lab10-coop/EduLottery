/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 */

const PrivateKeyProvider = require('truffle-privatekey-provider');
const DUMMY_PRIVKEY = '0000000000000000000000000000000000000000000000000000000000000001'


module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    /* 
    * in order to execute transactions on ARTIS, the env variable PRIVKEY needs to be set to a private key
    * for an address which is funded with ATS.
    * If not set, a dummy private key will be used instead which allows read-only operations.
    */
    tau1_rpc: {
      provider: () => new PrivateKeyProvider(process.env.PRIVKEY || DUMMY_PRIVKEY, 'https://rpc.tau1.artis.network'),
      gasPrice: 100*1E9,
      network_id: 246785,
    },
    sigma1_rpc: {
      provider: () => new PrivateKeyProvider(process.env.PRIVKEY || DUMMY_PRIVKEY, 'https://rpc.sigma1.artis.network'),
      gasPrice: 100*1E9,
      network_id: 246529,
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.7",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "constantinople"
    }
  }
}
