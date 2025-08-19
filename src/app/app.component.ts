import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CsvRepository } from './services/csv-repository.service';
import { Authenticator } from './services/authenticator.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'JailMonitorUi';

  names: string[][] = [];
  private emailAddress: string;

  constructor(
    private csvRepository: CsvRepository,
    private authenticator: Authenticator
  ) {
    csvRepository.initializeWithCredentials(authenticator.getCreds());
    // TODO use path or something else to set email address
    this.emailAddress = "test2";
  }

  test() {
    this.makeLocalNamesMatchRemote();
  }

  makeLocalNamesMatchRemote() {
    this.csvRepository.getNameListFromRemote(this.emailAddress, (x: string[][]) => {
      this.names = x;
      console.log(`Got names from remote`);
    });
  }

  makeRemoteMatchLocalNames() {
    this.csvRepository.publishNameListToRemote(this.emailAddress, this.names, (x: string) => {
      console.log(`Finished pushing names to remote`);
    });
  }

}
