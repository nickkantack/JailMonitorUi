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
  private areThereUnsavedChanges: boolean = false;

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

  addName() {
    this.names.push(["", ""]);
  }

  deleteRow(index: number): void {
    this.names.splice(index, 1);
    this.noteUnsavedChanges();
  }

  noteUnsavedChanges() {
    console.log(`There are unsaved changes`);
    this.areThereUnsavedChanges = true;
  }

  makeLocalNamesMatchRemote() {

    if (this.areThereUnsavedChanges) {
      if (!confirm(`You have unsaved changes on this page. Loading will replace everything on this page with the latest saved list of names. Are you sure you want to load the name list from the server and lose local changes?`)) {
        alert(`Your local changes have been preserved.`);
        return;
      }
    }

    this.csvRepository.getNameListFromRemote(this.emailAddress, (x: string[][]) => {
      this.names = x;
      console.log(`Got names from remote`);
    });
    this.areThereUnsavedChanges = false;
  }

  makeRemoteMatchLocalNames() {

    // First, do some validation
    this.names = this.names.filter((x: string[]) => {
      return x[0] || x[1];  
    });

    this.csvRepository.publishNameListToRemote(this.emailAddress, this.names, (x: string) => {
      console.log(`Finished pushing names to remote`);
    });

    this.areThereUnsavedChanges = false;
  }

}
