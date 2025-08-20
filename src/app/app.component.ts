import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CsvRepository } from './services/csv-repository.service';
import { Authenticator } from './services/authenticator.service';
import { FormsModule } from '@angular/forms';
import { StatusColor } from './constants/constants';

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
  message = "";
  flash = false;
  statusColor: StatusColor = StatusColor.NEUTRAL;

  constructor(
    private csvRepository: CsvRepository,
    private authenticator: Authenticator
  ) {
    csvRepository.initializeWithCredentials(authenticator.getCreds());
    // TODO use path or something else to set email address
    this.emailAddress = "test2";
  }

  test() {
    this.updateMessage(Math.random().toString(), StatusColor.NEUTRAL);
    // this.makeLocalNamesMatchRemote();
  }

  updateMessage(newMessage: string, color: StatusColor) {
    this.flash = false;

    // Re-trigger the animation
    setTimeout(() => {
      this.flash = true;
    });
    setTimeout(() => {
      this.flash = false;
    }, 500);

    // Change the text at the point in the animation where it is
    // invisible
    setTimeout(() => {
      this.message = newMessage;
      if (color) this.statusColor = color;
    }, 500);
  }

  addName() {
    this.names.push(["", ""]);
  }

  deleteRow(index: number): void {
    this.names.splice(index, 1);
    this.noteUnsavedChanges();
  }

  noteUnsavedChanges() {
    if (!this.areThereUnsavedChanges) {
      this.updateMessage(`Changes are not yet saved.`, StatusColor.WARN);
    }
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

    this.updateMessage(`Loading names...`, StatusColor.NEUTRAL);

    this.csvRepository.getNameListFromRemote(this.emailAddress, (x: string[][]) => {
      this.names = x;
      this.updateMessage(`Successfully loaded names from server.`, StatusColor.SUCCESS);
    });
    this.areThereUnsavedChanges = false;
  }

  makeRemoteMatchLocalNames() {

    // First, do some validation
    this.names = this.names.filter((x: string[]) => {
      return x[0] || x[1];  
    });

    this.updateMessage(`Saving to server...`, StatusColor.WARN);
    this.csvRepository.publishNameListToRemote(this.emailAddress, this.names, (x: string) => {
      console.log(`Finished pushing names to remote`);
      this.updateMessage(`Changes saved to server.`, StatusColor.SUCCESS);
    });

    this.areThereUnsavedChanges = false;
  }

}
