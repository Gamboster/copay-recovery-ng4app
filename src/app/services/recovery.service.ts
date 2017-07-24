import { Injectable } from '@angular/core';

import * as sjcl from 'sjcl';
import * as bitcore from 'bitcore-lib';
import * as Mnemonic from 'bitcore-mnemonic';
import * as _ from 'lodash';

@Injectable()
export class RecoveryService {

  public Transaction = bitcore.Transaction;
  public Address = bitcore.Address;

  constructor() { }

  prueba(dataBackUp: any) {
    console.log(this.fromBackup({backup: dataBackUp, password: "1"}, 1, 1, "testnet"));
    console.log(this.fromMnemonic({backup: "bundle truck place meadow hobby prize trial delay cost enact taxi alert"}, 1, 1, "livenet"));
    var buildWallet = this.fromMnemonic({backup: "bundle truck place meadow hobby prize trial delay cost enact taxi alert"}, 1, 1, "livenet");
    console.log("buildWallet", this.buildWallet([buildWallet, buildWallet]));
    console.log("PRUEBA-------------");
    var privateKey = new bitcore.PrivateKey();
    console.log("privateKey", privateKey);
    var code = new Mnemonic();
    console.log("code", code);
    console.log("Transaction", this.Transaction);
  }

  fromBackup(data: any, m: number, n: number, network: string) {
    if (!data.backup)
      return null;
    try {
      JSON.parse(data.backup);
    } catch (ex) {
      throw new Error("Your JSON is not valid, please copy only the text within (and including) the { } brackets around it.");
    };
    var payload;
    try {
      payload = sjcl.decrypt(data.password, data.backup);
    } catch (ex) {
      throw new Error("Incorrect backup password");
    };

    payload = JSON.parse(payload);

    if (!payload.n) {
      throw new Error("Backup format not recognized. If you are using a Copay Beta backup and version is older than 0.10, please see: https://github.com/bitpay/copay/issues/4730#issuecomment-244522614");
    }
    if ((payload.m != m) || (payload.n != n)) {
      throw new Error("The wallet configuration (m-n) does not match with values provided.");
    }
    if (payload.network != network) {
      throw new Error("Incorrect network.");
    }
    if (!(payload.xPrivKeyEncrypted) && !(payload.xPrivKey)) {
      throw new Error("The backup does not have a private key");
    }
    var xPriv = payload.xPrivKey;
    if (payload.xPrivKeyEncrypted) {
      try {
        xPriv = sjcl.decrypt(data.xPrivPass, payload.xPrivKeyEncrypted);
      } catch (ex) {
        throw new Error("Can not decrypt private key");
      }
    }
    var credential = {
      walletId: payload.walletId,
      copayerId: payload.copayerId,
      xPriv: xPriv,
      derivationStrategy: payload.derivationStrategy || "BIP45",
      addressType: payload.addressType || "P2SH",
      m: m,
      n: n,
      network: network,
      from: "backup",
    };
    return credential;
  }

  fromMnemonic(data: any, m: number, n: number, network: string) {
    if (!data.backup)
      return null;

    var words = data.backup;
    var passphrase = data.password;
    var xPriv;

    try {
      xPriv = new Mnemonic(words).toHDPrivateKey(passphrase, network).toString();
    } catch (ex) {
      throw new Error("Mnemonic wallet seed is not valid.");
    };

    var credential = {
      xPriv: xPriv,
      derivationStrategy: "BIP44",
      addressType: n == 1 ? "P2PKH" : "P2SH",
      m: m,
      n: n,
      network: network,
      from: "mnemonic",
    };
    return credential;
  }

  buildWallet(credentials: any) {
    var result: any;
    credentials = _.compact(credentials);
    if (credentials.length == 0)
      throw new Error('No data provided');

    if (_.uniq(_.map(credentials, 'from')).length != 1)
      throw new Error('Mixed backup sources not supported');

    result = _.pick(credentials[0], ["walletId", "derivationStrategy", "addressType", "m", "n", "network", "from"]);

    result.copayers = _.map(credentials, function(c: any) {
      if (c.walletId != result.walletId)
        throw new Error("Backups do not belong to the same wallets.");
      return {
        copayerId: c.copayerId,
        xPriv: c.xPriv,
      };
    });
    if (result.from == "backup") {
      if (_.uniq(_.compact(_.map(result.copayers, 'copayerId'))).length != result.copayers.length)
        throw new Error("Some of the backups belong to the same copayers");
    }

    console.log('Recovering wallet', result);

    return result;
  }

}
