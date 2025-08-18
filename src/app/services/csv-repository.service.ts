import { Injectable } from '@angular/core';
import { LambdaService } from './aws-lambda.service';

@Injectable({
  providedIn: 'root'
})
export class CsvRepository {

  constructor(
    private lambdaService: LambdaService
  ) {

  }

  initializeWithCredentials(credentials: string) {
    this.lambdaService.initializeWithCredentials(credentials);
  }

  async getNameListFromRemote(emailAddress: string, callback: Function) {

    const response = await this.lambdaService.invokeLambda(
      "GetCsvLambdaStack-GetCsvFunction4610AF86-hxeMUHNRkV8r",
      {
        email_address: emailAddress
      }
    );
    const undelimitedText = JSON.parse(response.body).csv_text;
    const lineDelimited = undelimitedText.trim().split("\n");
    const commaDelimited = lineDelimited.map((x: string) => x.replace(/\r/g, "").split(","));
    callback(commaDelimited);
  }

  async publishNameListToRemote(emailAddress: string, nameList: string[][], callback: Function) {

    const response = await this.lambdaService.invokeLambda(
      "UploadCsvLambdaStack-UploadCsvFunctionAC444C47-sFJbiY7qqw7P",
      {
        email_address: emailAddress,
        names: nameList
      }
    );
    callback(response.body);
  }

  test() {
    this.lambdaService.test();
  }
}