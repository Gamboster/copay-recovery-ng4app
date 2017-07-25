import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { RecoveryService } from '../app/services/recovery.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [RecoveryService]
})
export class AppComponent implements OnInit {

  public availableOptions: Array<any>;
  public availableNetworks: Array<any>;

  public signaturesNumber: number; //m
  public copayersNumber: number; //n
  public network: string; //net
  public addressGap: number;
  public beforeScan: boolean;

  public copayers = [1];

  public dataBackUp1: any;
  public data: any;

  public statusMessage: string;
  public successMessage: string;
  public errorMessage: string;
  public totalBalance: any;

  private wallet: any;
  private scanResults: any;
  private fee: number;

  constructor(private RecoveryService: RecoveryService) {
    this.addressGap = 20;
    this.data = {
      backUp: [],
      passX: [],
      pass: [],
      gap: this.addressGap
    };
    this.availableOptions = [1, 2, 3, 4, 5, 6];
    this.availableNetworks = ['livenet', 'testnet'];
    this.fee = 0.0001;
    this.signaturesNumber = this.availableOptions[0];
    this.copayersNumber = this.availableOptions[0];
    this.network = this.availableNetworks[0];
  }

  ngOnInit() {
    this.dataBackUp1 = "better gorilla chuckle goose orbit unique famous agree topple diary once pond";
    this.beforeScan = true;
  }

  updateCopayersForm() {
    this.copayers = _.map(_.range(1, this.copayersNumber + 1), function (i) {
      return i;
    });
  }

  processInputs() {
    let self = this;
    //$("#myModal").modal('show');
    this.beforeScan = true;

    var inputs = _.map(_.range(1, this.copayersNumber + 1), function (i) {
      return {
        backup: self.data.backUp[i] || '',
        password: self.data.pass[i] || '',
        xPrivPass: self.data.passX[i] || '',
      }
    });

    try {
      this.wallet = this.RecoveryService.getWallet(inputs, this.signaturesNumber, this.copayersNumber, this.network);
    } catch (ex) {
      //$("#myModal").modal('hide');
      return this.showMessage(ex.message, 3);
    }
    this.showMessage('Scanning funds...', 1);

    var reportFn = function (data) {
      console.log('Report:', data);
    };

    var gap = +this.data.gap;
    gap = gap ? gap : 20;

    this.RecoveryService.scanWallet(this.wallet, gap, reportFn, (err, res) => {
      this.scanResults = res;
      if (err)
        return this.showMessage(err, 3);

      this.showMessage('Search completed', 2);
      //$("#myModal").modal('hide');
      this.beforeScan = false;
      if ((this.scanResults.balance - this.fee) > 0)
        this.totalBalance = "Available balance: " + this.scanResults.balance.toFixed(8) + " BTC";
      else
        this.totalBalance = "Available balance: " + this.scanResults.balance.toFixed(8) + " BTC. Insufficents funds.";
    });
  }

  sendFunds(addr: string) {
    var toAddress = addr;
    var rawTx;

    try {
      rawTx = this.RecoveryService.createRawTx(toAddress, this.scanResults, this.wallet, this.fee);
    } catch (ex) {
      return this.showMessage(ex.message, 3);
    }

    this.RecoveryService.txBroadcast(rawTx, this.network).then((response) => {
      this.showMessage((this.scanResults.balance - this.fee).toFixed(8) + ' BTC sent to address: ' + toAddress, 2);
      console.log('Transaction complete.  ' + (this.scanResults.balance - this.fee) + ' BTC sent to address: ' + toAddress);
    },
      function (error) {
        this.showMessage('Could not broadcast transaction. Please, try later.', 3);
      });
  };

  showMessage(message: string, type: number) {
    /*
			1 = status
			2 = success
			3 = error
		*/

    if (type == 1) {
      this.statusMessage = message;
      this.successMessage = null;
      this.errorMessage = null;
    } else if (type == 2) {
      this.successMessage = message;
      this.statusMessage = null;
      this.errorMessage = null;
    } else if (type == 3) {
      this.errorMessage = message;
      this.statusMessage = null;
      this.successMessage = null;
    }
  }

}