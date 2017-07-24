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

  public signaturesNumber: number;
  public copayersNumber: number;
  public network: string;
  public addressGap: number;

  public copayers = [1];

  public dataBackUp1: any;

  constructor(private RecoveryService: RecoveryService) {
    this.availableOptions = [1, 2, 3, 4, 5, 6];
    this.availableNetworks = ['livenet', 'testnet'];

    this.signaturesNumber = this.availableOptions[0];
    this.copayersNumber = this.availableOptions[0];
    this.network = this.availableNetworks[0];
    this.addressGap = 20;
  }

  ngOnInit() {
    console.log("availableOptions", this.availableOptions);
  }

  updateCopayersForm() {
    
    this.copayers = _.map(_.range(1, this.copayersNumber + 1), function(i) {
      return i;
    });

    this.RecoveryService.prueba(this.dataBackUp1);

    console.log("Copayers", this.copayers);
  }

  processInputs() {
    console.log("processInputs!");
  }

}