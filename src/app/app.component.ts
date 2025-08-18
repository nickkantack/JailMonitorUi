import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CsvRepository } from './services/csv-repository.service';
import { Authenticator } from './services/authenticator.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'JailMonitorUi';

  private names: string[][] = [];

  constructor(
    private csvRepository: CsvRepository,
    private authenticator: Authenticator
  ) {
    csvRepository.initializeWithCredentials(authenticator.getCreds());
  }

  test() {
    console.log(`Testing my csv repository`);
    this.csvRepository.publishNameListToRemote("test3", [
      ["a", "b"],
      ["c", "d"]
    ], () => {
      this.csvRepository.getNameListFromRemote("test3", (x: string[][]) => {
        console.log(x);
      });
    });
  }

}
